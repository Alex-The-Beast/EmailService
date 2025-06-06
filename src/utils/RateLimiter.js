export class RateLimiter {
  constructor(maxRequests, timeWindow) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requestCounts = new Map(); // Key: operation identifier, Value: {count, windowStart}
  }

  isAllowed(key) {
    const now = Date.now();
    let record = this.requestCounts.get(key);

    if (!record || now - record.windowStart >= this.timeWindow) {
      record = { count: 1, windowStart: now };
      this.requestCounts.set(key, record);
      return true;
    }

    if (record.count < this.maxRequests) {
      record.count++;
      return true;
    }

    return false;
  }

  async waitUntilAllowed(key) {
    while (!this.isAllowed(key)) {
      const record = this.requestCounts.get(key);
      const waitTime = this.timeWindow - (Date.now() - record.windowStart);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
}
