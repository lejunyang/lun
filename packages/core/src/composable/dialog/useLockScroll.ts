import { getScrollbarWidth, pick, supportScrollbarGutter } from '@lun/utils';
import { tryOnScopeDispose } from '../../hooks';

const lockNumMap = new WeakMap<HTMLElement, number>(),
  lockElStyleMap = new WeakMap<
    HTMLElement,
    { overflow: string; scrollbarGutter: string; paddingRight: string; paddingBottom: string }
  >();
export function useLockScroll() {
  const localLocks = new Set<HTMLElement>();
  function lock(el: HTMLElement) {
    const prevNum = lockNumMap.get(el);
    if (prevNum) lockNumMap.set(el, prevNum + 1);
    else {
      lockNumMap.set(el, 1);
      // store the original style
      lockElStyleMap.set(el, pick(el.style, ['overflow', 'scrollbarGutter', 'paddingRight', 'paddingBottom']));
      el.style.setProperty('overflow', 'hidden', 'important');
      if (supportScrollbarGutter) el.style.setProperty('scrollbar-gutter', 'stable', 'important');
      else {
        const { paddingRight, paddingBottom } = getComputedStyle(el),
          { y, x } = getScrollbarWidth(el);
        el.style.setProperty('padding-right', `calc(${paddingRight} + ${y}px)`, 'important');
        el.style.setProperty('padding-bottom', `calc(${paddingBottom} + ${x}px)`, 'important');
      }
    }
    localLocks.add(el);
  }
  function unlock(el: HTMLElement, force?: boolean) {
    const num = lockNumMap.get(el);
    localLocks.delete(el);
    if (num === 1 || force) {
      // restore the style
      Object.assign(el.style, lockElStyleMap.get(el)!);
      lockNumMap.delete(el);
    } else if (num) lockNumMap.set(el, num - 1);
  }

  tryOnScopeDispose(() => {
    localLocks.forEach((e) => unlock(e));
  });
  return [lock, unlock] as const;
}
