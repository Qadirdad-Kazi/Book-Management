function bubbleSort(arr, compare = (a, b) => a - b) {
  const a = arr.slice();
  let n = a.length;
  let swapped;
  do {
    swapped = false;
    for (let i = 1; i < n; i++) {
      if (compare(a[i - 1], a[i]) > 0) {
        const tmp = a[i - 1];
        a[i - 1] = a[i];
        a[i] = tmp;
        swapped = true;
      }
    }
    n--;
  } while (swapped);
  return a;
}

module.exports = { bubbleSort };
