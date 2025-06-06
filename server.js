
import express from "express";
import { EmailService } from "./src/services/EmailServices.js";
import {
  MockProviderA,
  MockProviderB,
} from "./src/services/index.js";
import { Email } from "./src/models/Email.js";

const app = express();
app.use(express.json());

// Configure mock providers
const providerA = new MockProviderA();
const providerB = new MockProviderB();

const emailService = new EmailService({
  providers: [providerA, providerB],
  maxRetries: 3,
  rateLimit: 5, // 5 requests per minute for testing
  rateWindow: 60 * 1000,
  logLevel: "DEBUG"
});




app.post("/send", async (req, res) => {
  try {
    const { to, subject, body, id } = req.body;
    const email = new Email(to, subject, body, undefined, id);
    const result = await emailService.sendImmediately(email);
    
    res.json({
      success: result.success,
      provider: result.provider,
      attempts: result.attempts,
      message: result.message,
      emailId: email.id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get("/status/:emailId", (req, res) => {
  const status = emailService.getStatus(req.params.emailId);
  if (status) {
    res.json(status);
  } else {
    res.status(404).json({ error: "Email not found" });
  }
});


app.post("/toggle-failure/:provider", (req, res) => {
  const provider = req.params.provider;
  const successRate = parseFloat(req.body.successRate);
  
  if (provider === "MockProviderA") {
    providerA.successRate = successRate;
  } else if (provider === "MockProviderB") {
    providerB.successRate = successRate;
  } else {
    return res.status(400).json({ error: "Invalid provider" });
  }
  
  res.json({
    success: true,
    message: `${provider} success rate set to ${successRate}`
  });
});

/**
 * @api {get} /stats Get Service Statistics
 */
app.get("/stats", (req, res) => {
  res.json(emailService.getStats());
});

/**
 * @api {get} /test-all Run All Test Scenarios
 */
app.get("/test-all", async (req, res) => {
  const results = [];
  
  // Test 1: Successful send
  const email1 = new Email("test1@example.com", "Test 1", "Successful send");
  results.push(await testSend(email1, "Successful send"));
  
  // Test 2: Fallback to provider B
  providerA.successRate = 0; // Force Provider A to fail
  const email2 = new Email("test2@example.com", "Test 2", "Fallback test");
  results.push(await testSend(email2, "Fallback test"));
  providerA.successRate = 1; // Reset
  
  // Test 3: Idempotency
  const email3 = new Email("test3@example.com", "Test 3", "Idempotency test", undefined, "fixed-id-123");
  results.push(await testSend(email3, "Idempotency first send"));
  results.push(await testSend(email3, "Idempotency second send"));
  
  // Test 4: Rate limiting
  const rateLimited = [];
  for (let i = 0; i < 7; i++) {
    const email = new Email(`rate${i}@test.com`, "Rate Test", `Test ${i}`);
    rateLimited.push(testSend(email, `Rate test ${i}`));
  }
  results.push(...(await Promise.all(rateLimited)));
  
  res.json({ tests: results });
});

async function testSend(email, testName) {
  try {
    const result = await emailService.sendImmediately(email);
    return {
      test: testName,
      success: true,
      emailId: email.id,
      result: {
        provider: result.provider,
        attempts: result.attempts,
        message: result.message
      }
    };
  } catch (error) {
    return {
      test: testName,
      success: false,
      emailId: email.id,
      error: error.message
    };
  }
}

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`
Available endpoints:
  POST /send - Send an email
  GET /status/:emailId - Check email status
  POST /toggle-failure/:provider - Toggle provider failure mode
  GET /stats - Get service statistics
  GET /test-all - Run all test scenarios
`);
});