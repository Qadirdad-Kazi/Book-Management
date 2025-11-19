/* Simple demo runner for algorithms & data structures */
const {
  linearSearch,
  binarySearch,
  binarySearchRecursive,
  bubbleSort,
  selectionSort,
  insertionSort,
  mergeSort,
  quickSort,
  LinkedList,
  Stack,
  Queue,
} = require('./index');

function demoSearch() {
  const arr = [7, 2, 9, 2, 5];
  console.log('LinearSearch index of 9:', linearSearch(arr, 9));
  console.log('LinearSearch index of 3 (not found):', linearSearch(arr, 3));
  const sorted = mergeSort(arr);
  console.log('Sorted:', sorted);
  console.log('BinarySearch 5:', binarySearch(sorted, 5));
  console.log('BinarySearchRecursive 2:', binarySearchRecursive(sorted, 2));
}

function demoSort() {
  const arr = [5, 1, 4, 2, 8];
  console.log('BubbleSort:', bubbleSort(arr));
  console.log('SelectionSort:', selectionSort(arr));
  console.log('InsertionSort:', insertionSort(arr));
  console.log('MergeSort:', mergeSort(arr));
  console.log('QuickSort:', quickSort(arr));
}

function demoDataStructures() {
  const list = new LinkedList([1, 2, 3]);
  list.insertAtHead(0); // [0,1,2,3]
  list.insertAtTail(4); // [0,1,2,3,4]
  list.insertAt(3, 99); // [0,1,2,99,3,4]
  console.log('LinkedList toArray:', list.toArray());
  console.log('LinkedList getAt(3):', list.getAt(3));
  console.log('LinkedList find(3):', list.find(3));
  console.log('LinkedList updateAt(3, 42) old:', list.updateAt(3, 42));
  console.log('LinkedList removeAt(2) removed:', list.removeAt(2));
  console.log('LinkedList final:', list.toArray());

  const stack = new Stack();
  stack.push(10).push(20).push(30);
  console.log('Stack peek:', stack.peek());
  console.log('Stack pop:', stack.pop());
  console.log('Stack toArray:', stack.toArray());

  const queue = new Queue();
  queue.enqueue('a').enqueue('b').enqueue('c');
  console.log('Queue peek:', queue.peek());
  console.log('Queue dequeue:', queue.dequeue());
  console.log('Queue toArray:', queue.toArray());
}

function main() {
  console.log('--- Search Demo ---');
  demoSearch();
  console.log('\n--- Sort Demo ---');
  demoSort();
  console.log('\n--- Data Structures Demo ---');
  demoDataStructures();
}

main();
