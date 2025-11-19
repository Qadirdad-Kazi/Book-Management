class Stack {
  constructor(iterable = []) {
    this._a = [];
    for (const x of iterable) this.push(x);
  }
  push(x) { this._a.push(x); return this; }
  pop() { return this._a.pop() ?? null; }
  peek() { return this._a.length ? this._a[this._a.length - 1] : null; }
  size() { return this._a.length; }
  isEmpty() { return this._a.length === 0; }
  clear() { this._a.length = 0; }
  toArray() { return this._a.slice(); }
}

module.exports = { Stack };
