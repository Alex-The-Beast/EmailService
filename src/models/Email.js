export class Email {
  constructor(to, subject, body, from = "no-reply@example.com", id = null) {
    this.to = to;
    this.subject = subject;
    this.body = body;
    this.from = from;
    this.id = id || this.generateId();
    this.createdAt = new Date();
  }

  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  validate() {
    return this.to && this.subject && this.body;
  }
}
