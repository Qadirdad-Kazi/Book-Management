function quickSort(arr, compare = (a, b) => a - b) {
  const a = arr.slice();
  function qs(l, r) {
    if (l >= r) return;
    const pivot = a[Math.floor((l + r) / 2)];
    let i = l, j = r;
    while (i <= j) {
      while (compare(a[i], pivot) < 0) i++;
      while (compare(a[j], pivot) > 0) j--;
      if (i <= j) {
        const tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
        i++; j--;
      }
    }
    if (l < j) qs(l, j);
    if (i < r) qs(i, r);
  }
  qs(0, a.length - 1);
  return a;
}

module.exports = { quickSort };
