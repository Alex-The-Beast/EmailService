import { SendResult } from "../../models/SendResult.js";

export class MockProviderB {
  constructor() {
    this.name = "MockProviderB";
    this.successRate = 0.7; // 70% success rate
  }

  async send(email) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1500));

    if (Math.random() < this.successRate) {
      return SendResult.success(this.name, `Sent via ${this.name}`);
    } else {
      throw new Error(`${this.name} failed to send email`);
    }
  }
}
