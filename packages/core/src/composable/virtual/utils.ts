import { nearestBinarySearch, objectKeys } from '@lun/utils';
import { UseVirtualMeasurement, UseVirtualOptions } from './type';

export const getFurthestMeasurement = (
  options: UseVirtualOptions,
  measurements: UseVirtualMeasurement[],
  index: number,
) => {
  const lanesFound = new Set<number>(),
    laneFurthestMeasurement = {} as Record<number, UseVirtualMeasurement>;
  let furthestIndex: number,
    furthestEndOffset: number = Infinity;
  for (let m = index - 1; m >= 0; m--) {
    const measurement = measurements[m],
      { lane, offsetEnd } = measurement;
    if (lanesFound.has(lane)) continue;

    const previousFurthestMeasurement = laneFurthestMeasurement[lane];
    if (previousFurthestMeasurement == null || offsetEnd > previousFurthestMeasurement.offsetEnd) {
      laneFurthestMeasurement[lane] = measurement;
      if (offsetEnd <= furthestEndOffset) {
        furthestEndOffset = offsetEnd;
        furthestIndex = m;
      }
    } else if (offsetEnd < previousFurthestMeasurement.offsetEnd) lanesFound.add(lane);

    if (lanesFound.size === options.lanes) break;
  }

  return objectKeys(laneFurthestMeasurement).length === options.lanes ? measurements[furthestIndex!] : null;
};

export function calculateRange(measurements: UseVirtualMeasurement[], containerSize: number, scrollOffset: number) {
  const count = measurements.length - 1;
  const startIndex = nearestBinarySearch(0, count, (index) => measurements[index].offsetStart, scrollOffset);
  let endIndex = startIndex;

  while (endIndex < count && measurements[endIndex].offsetEnd < scrollOffset + containerSize) {
    endIndex++;
  }
  return [startIndex, endIndex] as const;
}
