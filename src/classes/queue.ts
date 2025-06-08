import { Message } from "../types";

class Queue {
  private elements: Message[];
  constructor() {
    this.elements = [];
  }

  enqueue(node: Message) {
    this.elements.push(node);
  }

  dequeue() {
    if (this.elements.length > 0) {
      return this.elements.shift();
    } else {
      return "Underflow situation";
    }
  }
  isEmpty() {
    return this.elements.length == 0;
  }

  front() {
    if (this.elements.length > 0) {
      return this.elements[0];
    } else {
      return null;
    }
  }

  print() {
    return this.elements;
  }
}

export default Queue;
