import { Message } from "../types";

class Node {
  data: Message;
  constructor(data: Message) {
    this.data = data;
  }
}

export default Node;
