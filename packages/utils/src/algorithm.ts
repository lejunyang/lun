export function nearestBinarySearch(
  startIndex: number,
  endIndex: number,
  getVal: (i: number) => number,
  searchVal: number,
) {
  while (startIndex <= endIndex) {
    const middle = ((startIndex + endIndex) / 2) | 0;
    const currentValue = getVal(middle);
    if (currentValue < searchVal) startIndex = middle + 1;
    else if (currentValue > searchVal) endIndex = middle - 1;
    else return middle;
  }
  return startIndex > 0 ? startIndex - 1 : 0;
}
