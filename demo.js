import { EmailService } from "./src/services/EmailServices.js";
import {
  MockProviderA,
  MockProviderB,
} from "./src/services/index.js";
import { Email } from "./src/models/Email.js";

// Configure providers with different failure rates
const failingProviderA = new MockProviderA();
failingProviderA.successRate = 0.3; // 70% failure rate

const reliableProviderB = new MockProviderB();
reliableProviderB.successRate = 1.0; // 100% success rate

const emailService = new EmailService({
  providers: [failingProviderA, reliableProviderB],
  maxRetries: 2,
  rateLimit: 3, // 3 requests per minute
  rateWindow: 60 * 1000,
  logLevel: "DEBUG",
});

async function runTests() {
  // Test 1: Normal send with potential fallback
  console.log("\n=== TEST 1: Normal send with fallback ===");
  const email1 = new Email(
    "test1@example.com",
    "Test 1",
    "This may trigger fallback"
  );
  await testSend(email1);

  // Test 2: Duplicate send (idempotency check)
  console.log("\n=== TEST 2: Duplicate send ===");
  await testSend(email1); // Same email object

  // Test 3: Rate limiting test
  console.log("\n=== TEST 3: Rate limiting ===");
  const parallelEmails = [
    new Email("test2@example.com", "Test 2", "Parallel 1"),
    new Email("test3@example.com", "Test 3", "Parallel 2"),
    new Email("test4@example.com", "Test 4", "Parallel 3"),
    new Email("test5@example.com", "Test 5", "Should be rate limited"),
  ];
  await Promise.all(parallelEmails.map(testSend));

  // Test 4: Circuit breaker trip
  console.log("\n=== TEST 4: Circuit breaker ===");
  const failingEmail = new Email(
    "fail@example.com",
    "Fail",
    "This will trip circuit breaker"
  );
  failingProviderA.successRate = 0; // 100% failure
  for (let i = 0; i < 5; i++) {
    await testSend(failingEmail);
  }
}

async function testSend(email) {
  try {
    console.log(`\nAttempting to send email ${email.id}`);
    const result = await emailService.sendImmediately(email);
    console.log(
      `Result: ${result.success ? "SUCCESS" : "FAILED"} via ${result.provider}`
    );
    console.log(`Attempts: ${result.attempts}, Message: ${result.message}`);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

runTests();
