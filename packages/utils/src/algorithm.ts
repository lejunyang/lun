export function binarySearch(arr: Array<any>, compareFn: (item: any) => number) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (compareFn(arr[mid]) === 0) {
      return mid;
    } else if (compareFn(arr[mid]) < 0) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;
}
