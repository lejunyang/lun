import { isNumber } from '@lun/utils';
import { ScrollViewObserveViewRangeValue } from './type';

const axisMap = {
  x: 'width',
  y: 'height',
} as const;
export function calcProgress(
  scrollerRect: { width: number; height: number; x: number; y: number },
  intersectionRect: DOMRect,
  axis: 'x' | 'y',
  options: [ScrollViewObserveViewRangeValue, ScrollViewObserveViewRangeValue],
) {
  const size = axisMap[axis];
  const coverStart = scrollerRect[axis] + scrollerRect[size],
    coverEnd = scrollerRect[axis] - intersectionRect[size],
    containStart = scrollerRect[axis] + scrollerRect[size] - intersectionRect[size],
    containEnd = scrollerRect[axis];

  let start = coverStart,
    end = coverEnd;
  if (isNumber(options[0])) start = coverStart + options[0];
  else if (['cover', 'entry'].includes(options[0])) start = coverStart;
  else if (options[0] === 'contain') start = containStart;
  else if (options[0] === 'exit') start = containEnd;

  if (isNumber(options[1])) end = coverEnd - options[1];
  else if (['cover', 'exit'].includes(options[1] as any)) end = coverEnd;
  else if (options[1] === 'contain') end = containEnd;
  else if (options[1] === 'entry') end = containStart;

  return Math.max(0, (start - intersectionRect[axis]) / (end - start));
}
