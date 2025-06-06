/**
 * Circuit breaker pattern implementation
 */
export class CircuitBreaker {
  constructor({ failureThreshold = 3, successThreshold = 2, timeout = 5000 }) {
    this.state = "CLOSED"; // CLOSED, OPEN, or HALF
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = 0;
    this.failureThreshold = failureThreshold;
    this.successThreshold = successThreshold;
    this.timeout = timeout;
  }

  async execute(fn) {
    if (this.state === "OPEN") {
      if (Date.now() > this.nextAttempt) {
        this.state = "HALF";
      } else {
        throw new Error("Circuit breaker is open");
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  onSuccess() {
    if (this.state === "HALF") {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.reset();
      }
    }
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.trip();
    }
  }

  reset() {
    this.state = "CLOSED";
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = 0;
  }

  trip() {
    this.state = "OPEN";
    this.nextAttempt = Date.now() + this.timeout;
  }
}
