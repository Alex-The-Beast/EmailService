export class QueueItem {
  constructor(email, resolve, reject, attempts = 0) {
    this.email = email;
    this.resolve = resolve;
    this.reject = reject;
    this.attempts = attempts;
    this.createdAt = new Date();
  }
}
