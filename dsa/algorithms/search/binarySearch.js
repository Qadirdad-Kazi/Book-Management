function defaultCompare(a, b) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

// Iterative binary search on a sorted array. Returns index or -1
function binarySearch(arr, target, compare = defaultCompare) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    const cmp = compare(arr[mid], target);
    if (cmp === 0) return mid;
    if (cmp < 0) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

// Recursive binary search helper
function binarySearchRecursive(arr, target, compare = defaultCompare) {
  function helper(l, r) {
    if (l > r) return -1;
    const mid = l + Math.floor((r - l) / 2);
    const cmp = compare(arr[mid], target);
    if (cmp === 0) return mid;
    if (cmp < 0) return helper(mid + 1, r);
    return helper(l, mid - 1);
  }
  return helper(0, arr.length - 1);
}

module.exports = { binarySearch, binarySearchRecursive };
