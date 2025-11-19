class Queue {
  constructor(iterable = []) {
    this._a = [];
    this._head = 0;
    for (const x of iterable) this.enqueue(x);
  }
  enqueue(x) { this._a.push(x); return this; }
  dequeue() {
    if (this.isEmpty()) return null;
    const val = this._a[this._head++];
    // compact array if head grows too large
    if (this._head > 32 && this._head * 2 > this._a.length) {
      this._a = this._a.slice(this._head);
      this._head = 0;
    }
    return val;
  }
  peek() { return this.isEmpty() ? null : this._a[this._head]; }
  size() { return this._a.length - this._head; }
  isEmpty() { return this.size() === 0; }
  clear() { this._a = []; this._head = 0; }
  toArray() { return this._a.slice(this._head); }
}

module.exports = { Queue };
