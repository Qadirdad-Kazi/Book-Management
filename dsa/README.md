# DSA (Data Structures & Algorithms)

This folder contains self-contained JavaScript implementations of common data structures and algorithms, plus small runnable examples. They do not affect the app — they are for learning, testing, and reuse.

## Contents

- Algorithms
  - Search: Linear Search, Binary Search (iterative/recursive)
  - Sort: Bubble, Selection, Insertion, Merge, Quick
- Data Structures (CRUD-style operations)
  - LinkedList: insert, delete, update, find, get
  - Stack: push, pop, peek
  - Queue: enqueue, dequeue, peek

## Quick Run

Use Node to run the sample driver:

```
node dsa/run.js
```

You can import and use individual modules as needed:

```
const { linearSearch, binarySearch } = require('./dsa/algorithms/search');
const { mergeSort } = require('./dsa/algorithms/sort');
const { LinkedList, Stack, Queue } = require('./dsa/data-structures');
```

## Complexity Summary

- Linear Search: O(n)
- Binary Search: O(log n) on sorted arrays
- Bubble/Selection/Insertion: O(n^2)
- Merge/Quick (avg): O(n log n)
- LinkedList ops (by index):
  - get/insert/remove/update at index: O(n)
  - insert/remove at head: O(1)
- Stack/Queue ops: O(1)

## Notes

- Binary search requires a sorted array.
- These modules are framework-agnostic and can be used in backend or frontend.