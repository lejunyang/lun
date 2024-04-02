import {
  getScrollbarWidth,
  getWindow,
  isRootOrBody,
  objectKeys,
  pick,
  setStyle,
  supportScrollbarGutter,
} from '@lun/utils';
import { tryOnScopeDispose } from '../../hooks';

const lockNumMap = new WeakMap<HTMLElement, number>(),
  lockElStyleMap = new WeakMap<HTMLElement, Partial<CSSStyleDeclaration>>(),
  scrollPositionMap = new WeakMap<HTMLElement, [number, number]>();
export function useLockScroll() {
  const localLocks = new Set<HTMLElement>();

  function storeAndSetStyle(el: HTMLElement, style: Partial<CSSStyleDeclaration>) {
    lockElStyleMap.set(el, pick(el.style, objectKeys(style)));
    setStyle(el, style, true);
  }

  function lock(el: HTMLElement) {
    const prevNum = lockNumMap.get(el);
    if (prevNum) lockNumMap.set(el, prevNum + 1);
    else {
      lockNumMap.set(el, 1);
      const { y } = getScrollbarWidth(el);

      // found that overflow hidden + scrollbar-gutter stable(or padding, width, margin...) is not working on vitepress, it will still shift the layout
      // because the aside menu is position: fixed, width: calc(100% - ...). its parent is not root html but the viewport. it'll get wider when we set overflow:hidden on html
      // so we need to choose another way
      if (isRootOrBody(el)) {
        const {
          document: { documentElement, body },
          scrollX,
          scrollY,
        } = getWindow(el);
        scrollPositionMap.set(el, [scrollX, scrollY]);
        // do not add scrollY on html's top or translate, or it will affect fixed children elements, we set it on body
        storeAndSetStyle(documentElement, {
          position: 'fixed',
          top: `0`,
          left: '0',
          bottom: '0',
          right: '0',
          transform: 'translate(0,0)', // to let it become parent of those fixed
        });
        storeAndSetStyle(body, {
          position: 'relative',
          top: `-${scrollY}px`,
          left: scrollX + 'px',
          right: y + 'px',
        });
      } else {
        storeAndSetStyle(el, {
          overflow: 'hidden',
          scrollbarGutter: supportScrollbarGutter ? 'stable' : undefined,
          paddingRight: `calc(${getComputedStyle(el).paddingRight} + ${y}px)`,
        });
      }
    }
    localLocks.add(el);
  }

  function restoreElStyle(el: HTMLElement) {
    const style = lockElStyleMap.get(el);
    if (style) Object.assign(el.style, style);
  }

  function unlock(el: HTMLElement, force?: boolean) {
    const num = lockNumMap.get(el);
    localLocks.delete(el);
    if (num === 1 || force) {
      if (isRootOrBody(el)) {
        const elWindow = getWindow(el);
        const { documentElement, body } = elWindow.document;
        restoreElStyle(documentElement);
        restoreElStyle(body);
        const [scrollX, scrollY] = scrollPositionMap.get(el)!;
        elWindow.scrollTo(scrollX, scrollY);
      } else restoreElStyle(el);
      lockNumMap.delete(el);
    } else if (num) lockNumMap.set(el, num - 1);
  }

  tryOnScopeDispose(() => {
    localLocks.forEach((e) => unlock(e));
  });
  return [lock, unlock] as const;
}
