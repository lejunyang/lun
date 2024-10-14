import { isNumber } from '@lun/utils';
import { ScrollViewObserveViewRangeValue } from './type';

const axisMap = {
  x: 'width',
  y: 'height',
} as const;

const scrollMap = {
    x: 'scrollX',
    y: 'scrollY',
  } as const,
  offsetMap = {
    x: 'left',
    y: 'top',
  } as const;
export function calcProgress(
  scrollerRect: { width: number; height: number; scrollX: number; scrollY: number },
  subjectMeasurement: { width: number; height: number; top: number; left: number },
  axis: 'x' | 'y',
  options: [ScrollViewObserveViewRangeValue, ScrollViewObserveViewRangeValue],
) {
  const size = axisMap[axis],
    scrollProp = scrollMap[axis],
    offsetProp = offsetMap[axis];
  const coverStart = subjectMeasurement[offsetProp] - scrollerRect[size],
    coverEnd = subjectMeasurement[offsetProp] + subjectMeasurement[size],
    containStart = coverStart + subjectMeasurement[size],
    containEnd = subjectMeasurement[offsetProp];

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

  return Math.max(0, (scrollerRect[scrollProp] - start) / (end - start));
}

// getBoundingClientRect gets the rect after transform, we need to get original position
export function measureSubject(scroller: HTMLElement, subject: HTMLElement) {
  let top = 0,
    left = 0;
  let node = subject;
  const ancestor = scroller.offsetParent;
  while (node && node != ancestor) {
    left += node.offsetLeft;
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement;
  }
  left -= scroller.offsetLeft + scroller.clientLeft;
  top -= scroller.offsetTop + scroller.clientTop;
  return {
    top,
    left,
    width: subject.offsetWidth,
    height: subject.offsetHeight,
  };
}
