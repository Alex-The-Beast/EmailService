import { QueueItem } from "./QueueItem.js";
export class EmailQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.paused = false;
  }

  enqueue(email) {
    return new Promise((resolve, reject) => {
      this.queue.push(new QueueItem(email, resolve, reject));
      if (!this.processing && !this.paused) {
        this.processNext();
      }
    });
  }

  async processNext() {
    if (this.queue.length === 0 || this.paused) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const item = this.queue.shift();

    try {
      const result = await this.processItem(item);
      item.resolve(result);
    } catch (error) {
      item.reject(error);
    } finally {
      this.processNext();
    }
  }

  async processItem(item) {
    throw new Error("processItem must be implemented by subclass");
  }

  pause() {
    this.paused = true;
  }

  resume() {
    if (this.paused) {
      this.paused = false;
      this.processNext();
    }
  }

  size() {
    return this.queue.length;
  }

  clear() {
    this.queue = [];
  }
}
