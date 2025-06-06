import { RateLimiter } from "../utils/RateLimiter.js";
import { CircuitBreaker } from "../utils/CircuitBreaker.js";
import { ExponentialBackoff } from "../utils/ExponentialBackoff.js";
import { Logger } from "../utils/Logger.js";
import { EmailQueue } from "../queue/EmailQueue.js";
import { SendResult } from "../models/SendResult.js";

export class EmailService extends EmailQueue {
  constructor({
    providers = [],
    maxRetries = 3,
    rateLimit = 100,
    rateWindow = 60 * 1000, // 1 minute
    backoff = { initialDelay: 100, maxDelay: 5000, factor: 2, jitter: true },
    logLevel = "INFO",
  } = {}) {
    super();

    if (providers.length < 1) {
      throw new Error("At least one email provider is required");
    }

    this.providers = providers;
    this.maxRetries = maxRetries;
    this.rateLimiter = new RateLimiter(rateLimit, rateWindow);
    this.backoff = new ExponentialBackoff(backoff);
    this.logger = new Logger(logLevel);

    // Initialize circuit breakers for each provider
    this.circuitBreakers = this.providers.map(
      (provider) =>
        new CircuitBreaker({
          failureThreshold: 3,
          successThreshold: 2,
          timeout: 30000,
        })
    );

    // Track sent emails for idempotency
    this.sentEmails = new Map();

    this.logger.info("EmailService initialized with", {
      providerCount: this.providers.length,
      maxRetries,
      rateLimit,
      rateWindow,
    });
  }

  async processItem(item) {
    const { email, attempts } = item;

    // Check idempotency
    if (this.sentEmails.has(email.id)) {
      const existingResult = this.sentEmails.get(email.id);
      this.logger.debug(`Idempotency check - email ${email.id} already sent`);
      return existingResult;
    }

    // Apply rate limiting
    await this.rateLimiter.waitUntilAllowed("send-email");

    try {
      const result = await this.sendWithRetry(email, attempts);
      this.sentEmails.set(email.id, result);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send email after ${attempts + 1} attempts`,
        error
      );
      return SendResult.failure(
        "All providers",
        "All providers failed",
        error,
        attempts + 1
      );
    }
  }

  async sendWithRetry(email, attempts = 0) {
    if (attempts >= this.maxRetries) {
      throw new Error(`Max retries (${this.maxRetries}) exceeded`);
    }

    // Try each provider in order until one succeeds
    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[i];
      const circuitBreaker = this.circuitBreakers[i];

      try {
        this.logger.debug(`Attempt ${attempts + 1} with ${provider.name}`);

        const result = await circuitBreaker.execute(() => provider.send(email));

        this.logger.info(`Email sent successfully via ${provider.name}`, {
          emailId: email.id,
          to: email.to,
          attempts: attempts + 1,
        });

        return result;
      } catch (error) {
        this.logger.warn(
          `Attempt ${attempts + 1} failed with ${provider.name}`,
          error.message
        );

        // If this was the last provider in the list, proceed to retry
        if (i === this.providers.length - 1) {
          const delay = this.backoff.calculate(attempts);
          this.logger.debug(`Waiting ${delay}ms before retry`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.sendWithRetry(email, attempts + 1);
        }

        // Otherwise continue to next provider without counting as an attempt
        continue;
      }
    }

    // This line should theoretically never be reached
    throw new Error("Unexpected error in sendWithRetry");
  }

  async sendImmediately(email) {
    if (!email.validate()) {
      throw new Error("Invalid email: missing required fields");
    }

    return this.sendWithRetry(email);
  }

  getStatus(emailId) {
    return this.sentEmails.get(emailId) || null;
  }

  getStats() {
    const results = Array.from(this.sentEmails.values());

    return {
      total: results.length,
      success: results.filter((r) => r.success).length,
      failure: results.filter((r) => !r.success).length,
      providers: this.providers.reduce((acc, provider) => {
        acc[provider.name] = results.filter(
          (r) => r.provider === provider.name
        ).length;
        return acc;
      }, {}),
    };
  }
}
