class ListNode {
  constructor(value, next = null) {
    this.value = value;
    this.next = next;
  }
}

class LinkedList {
  constructor(iterable = []) {
    this.head = null;
    this._size = 0;
    for (const item of iterable) this.insertAtTail(item);
  }

  size() { return this._size; }
  isEmpty() { return this._size === 0; }

  insertAtHead(value) {
    const node = new ListNode(value, this.head);
    this.head = node;
    this._size++;
    return this;
  }

  insertAtTail(value) {
    const node = new ListNode(value);
    if (!this.head) {
      this.head = node;
      this._size++;
      return this;
    }
    let curr = this.head;
    while (curr.next) curr = curr.next;
    curr.next = node;
    this._size++;
    return this;
  }

  insertAt(index, value) {
    if (index < 0 || index > this._size) throw new RangeError('Index out of bounds');
    if (index === 0) return this.insertAtHead(value);
    let prev = this.head;
    for (let i = 0; i < index - 1; i++) prev = prev.next;
    const node = new ListNode(value, prev.next);
    prev.next = node;
    this._size++;
    return this;
  }

  removeAt(index) {
    if (index < 0 || index >= this._size) return null;
    if (index === 0) {
      const val = this.head.value;
      this.head = this.head.next;
      this._size--;
      return val;
    }
    let prev = this.head;
    for (let i = 0; i < index - 1; i++) prev = prev.next;
    const removed = prev.next;
    prev.next = removed.next;
    this._size--;
    return removed.value;
  }

  updateAt(index, value) {
    const node = this._nodeAt(index);
    if (!node) return null;
    const old = node.value;
    node.value = value;
    return old;
  }

  getAt(index) {
    const node = this._nodeAt(index);
    return node ? node.value : null;
  }

  _nodeAt(index) {
    if (index < 0 || index >= this._size) return null;
    let curr = this.head;
    for (let i = 0; i < index; i++) curr = curr.next;
    return curr;
  }

  find(value, compare = (a, b) => (a === b ? 0 : a < b ? -1 : 1)) {
    let curr = this.head, idx = 0;
    while (curr) {
      if (compare(curr.value, value) === 0) return idx;
      curr = curr.next; idx++;
    }
    return -1;
  }

  toArray() {
    const out = [];
    let curr = this.head;
    while (curr) { out.push(curr.value); curr = curr.next; }
    return out;
  }

  clear() {
    this.head = null;
    this._size = 0;
  }
}

module.exports = { LinkedList };
