import { SendResult } from "../../models/SendResult.js";

export class MockProviderA {
  constructor() {
    this.name = "MockProviderA";
    this.successRate = 0.8; // 80% success rate
  }

  async send(email) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));

    if (Math.random() < this.successRate) {
      return SendResult.success(this.name, `Sent via ${this.name}`);
    } else {
      throw new Error(`${this.name} failed to send email`);
    }
  }
}
