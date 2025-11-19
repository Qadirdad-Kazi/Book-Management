function defaultCompare(a, b) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

// Returns the first index of target in arr or -1
function linearSearch(arr, target, compare = defaultCompare) {
  for (let i = 0; i < arr.length; i++) {
    if (compare(arr[i], target) === 0) return i;
  }
  return -1;
}

// Returns all indices matching target
function linearSearchAll(arr, target, compare = defaultCompare) {
  const indices = [];
  for (let i = 0; i < arr.length; i++) {
    if (compare(arr[i], target) === 0) indices.push(i);
  }
  return indices;
}

module.exports = { linearSearch, linearSearchAll };
