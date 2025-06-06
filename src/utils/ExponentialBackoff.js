/**
 * Exponential backoff calculator
 */
export class ExponentialBackoff {
  constructor({
    initialDelay = 100,
    maxDelay = 10000,
    factor = 2,
    jitter = true,
  } = {}) {
    this.initialDelay = initialDelay;
    this.maxDelay = maxDelay;
    this.factor = factor;
    this.jitter = jitter;
  }

  calculate(attempt) {
    let delay = Math.min(
      this.initialDelay * Math.pow(this.factor, attempt),
      this.maxDelay
    );

    if (this.jitter) {
      delay = this.applyJitter(delay);
    }

    return delay;
  }

  applyJitter(delay) {
    const jitter = delay * 0.1; // ±10% jitter
    return delay - jitter + Math.random() * 2 * jitter;
  }
}
