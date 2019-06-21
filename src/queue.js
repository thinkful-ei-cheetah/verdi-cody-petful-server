'use strict';

class _Node {
  constructor(value, next) {
    this.value = value;
    this.next = next;
  }
}

class Queue {
  constructor() {
    this.first = null;
    this.last = null;
    this.length = 0;
  }

  enqueue(data) {
    const node = new _Node(data);

    if (!this.first) {
      this.first = node;
    }

    if (this.last) {
      this.last.next = node;
    }
    //make the new node the last item on the queue
    this.last = node;
    this.length++;
  }

  dequeue() {
    //if the queue is empty, there is nothing to return
    if (!this.first) {
      return;
    }
    const node = this.first;
    this.first = this.first.next;
    //if this is the last item in the queue
    if (node === this.last) {
      this.last = null;
    }

    this.length--;
    return node.value;
  }

  display() {
    const result = [];
    if (this.length === 0) return result;
    let currNode = this.first;
    if (!currNode.next) {
      result.push(this.first);
      return result;
    }
    while (currNode) {
      result.push(currNode.value);
      currNode = currNode.next;
    }
    return result;
  }
}

module.exports = Queue;