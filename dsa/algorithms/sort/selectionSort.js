function selectionSort(arr, compare = (a, b) => a - b) {
  const a = arr.slice();
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (compare(a[j], a[minIdx]) < 0) minIdx = j;
    }
    if (minIdx !== i) {
      const tmp = a[i];
      a[i] = a[minIdx];
      a[minIdx] = tmp;
    }
  }
  return a;
}

module.exports = { selectionSort };
