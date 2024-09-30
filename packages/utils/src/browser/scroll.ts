import { debounce, rafThrottle } from '../time';
import { AnyFn } from '../type';
import { on } from './event';
import { isRootOrBody } from './is';
import { isRTL } from './style';
import { isSupportScrollEnd } from './support';

export function getScrollbarWidth(el: HTMLElement) {
  const { clientWidth, offsetWidth, clientHeight, offsetHeight } = el;
  if (isRootOrBody(el)) {
    return {
      x: window.innerHeight - document.documentElement.clientHeight,
      y: window.innerWidth - document.documentElement.clientWidth,
    };
  }
  return {
    x: offsetHeight - clientHeight,
    y: offsetWidth - clientWidth,
  };
}

export function listenScroll(
  el: Element,
  onUpdate: (state: {
    scrolling: boolean;
    offsetX: number;
    offsetY: number;
    xForward: boolean;
    yForward: boolean;
  }) => void,
  {
    scrollEndDelay,
    frames,
  }: {
    frames?: number;
    scrollEndDelay?: number;
  } = {},
) {
  const cleanFns: AnyFn[] = [],
    listenOption = { passive: true };
  let scrollEndDebounce: AnyFn, lastOffsetX: number, lastOffsetY: number;
  const updateOffset = (scrolling = false) => {
    const offsetX = el.scrollLeft * (isRTL(el) ? -1 : 1),
      offsetY = el.scrollTop;
    onUpdate(
      // when it's RTL, scrollLeft is negative
      { scrolling, offsetX, offsetY, xForward: offsetX > lastOffsetX, yForward: offsetY > lastOffsetY },
    );
    lastOffsetX = offsetX;
    lastOffsetY = offsetY;
  };
  isSupportScrollEnd()
    ? cleanFns.push(on(el, 'scrollend', () => updateOffset(), listenOption))
    : (scrollEndDebounce = debounce(() => updateOffset(), scrollEndDelay || 150));
  cleanFns.push(
    on(
      el,
      'scroll',
      rafThrottle(() => {
        updateOffset(true);
        scrollEndDebounce?.();
      }, frames),
      listenOption,
    ),
  );

  return () => cleanFns.forEach((fn) => fn());
}
