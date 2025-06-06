export class SendResult {
  constructor(
    provider,
    success,
    message = "",
    error = null,
    attempts = 1,
    timestamp = new Date()
  ) {
    this.provider = provider;
    this.success = success;
    this.message = message;
    this.error = error;
    this.attempts = attempts;
    this.timestamp = timestamp;
  }

  static success(provider, message = "Email sent successfully") {
    return new SendResult(provider, true, message);
  }

  static failure(
    provider,
    message = "Failed to send email",
    error = null,
    attempts = 1
  ) {
    return new SendResult(provider, false, message, error, attempts);
  }
}
