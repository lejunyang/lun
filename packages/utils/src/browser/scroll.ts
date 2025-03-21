import { debounce } from '../time';
import { rafThrottle } from './time';
import { AnyFn } from '../type';
import { getDocumentElement } from './dom';
import { on } from './event';
import { isRootOrBody, isWindow } from './is';
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
  el: Element | Window,
  onUpdate: (state: {
    scrolling: boolean;
    offsetX: number;
    offsetY: number;
    xForward: boolean | null;
    yForward: boolean | null;
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
    listenOption = { passive: true },
    elIsWin = isWindow(el);
  let scrollEndDebounce: AnyFn,
    lastOffsetX = 0,
    lastOffsetY = 0;
  const updateOffset = (scrolling = false) => {
    const offsetX = elIsWin ? el.scrollX : el.scrollLeft * (isRTL(elIsWin ? getDocumentElement(el) : el) ? -1 : 1),
      offsetY = elIsWin ? el.scrollY : el.scrollTop;
    onUpdate(
      // when it's RTL, scrollLeft is negative
      {
        scrolling,
        offsetX,
        offsetY,
        xForward: offsetX === lastOffsetX ? null : offsetX > lastOffsetX,
        yForward: offsetY === lastOffsetY ? null : offsetY > lastOffsetY,
      },
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
