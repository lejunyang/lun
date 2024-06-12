import {
  getCachedComputedStyle,
  getScrollbarWidth,
  getWindow,
  isOverflow,
  isRootOrBody,
  raf,
  supportCSSScrollbarGutter,
  toPxIfNum,
} from '@lun/utils';
import { tryOnScopeDispose } from '../../hooks';
import { useTempInlineStyle } from './useTempInlineStyle';

const lockNumMap = new WeakMap<HTMLElement, number>(),
  scrollPositionMap = new WeakMap<HTMLElement, [number, number]>();
export function useLockScroll({
  scrollLeftName = '--lock-scroll-left',
  scrollTopName = '--lock-scroll-top',
}: {
  scrollLeftName?: `--${string}`;
  scrollTopName?: `--${string}`;
} = {}) {
  const localLocks = new Set<HTMLElement>();

  const [storeAndSetStyle, restoreElStyle] = useTempInlineStyle(true);

  function lock(el: HTMLElement) {
    const prevNum = lockNumMap.get(el);
    if (prevNum) lockNumMap.set(el, prevNum + 1);
    else {
      if (!isOverflow(el)) return;
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
          overflowY: 'scroll', // use scroll bar to occupy the space, don't have to use right: y + 'px'
          transform: 'translate(0,0)', // to let it become parent of those fixed
        });
        storeAndSetStyle(body, {
          position: 'relative',
          top: `-${scrollY}px`,
          left: scrollX + 'px',
        });
      } else {
        const { scrollLeft, scrollTop } = el;
        const sx = toPxIfNum(scrollLeft),
          sy = toPxIfNum(scrollTop);
        scrollPositionMap.set(el, [scrollLeft, scrollTop]);
        storeAndSetStyle(el, {
          overflow: 'hidden',
          scrollbarGutter: supportCSSScrollbarGutter ? 'stable' : undefined,
          paddingRight: supportCSSScrollbarGutter
            ? undefined
            : `calc(${getCachedComputedStyle(el).paddingRight} + ${y}px)`,
          [scrollLeftName]: sx,
          [scrollTopName]: sy,
        });
        // seems need to set scrollTop after a frame, or it doesn't work
        raf(() => {
          el.scrollTop = scrollTop;
        });
      }
    }
    localLocks.add(el);
  }

  function unlock(el: HTMLElement) {
    const num = lockNumMap.get(el),
      pos = scrollPositionMap.get(el);
    localLocks.delete(el);
    if (num === 1 && pos) {
      const [scrollLeft, scrollTop] = pos;
      if (isRootOrBody(el)) {
        const elWindow = getWindow(el);
        const { documentElement, body } = elWindow.document;
        restoreElStyle(documentElement);
        restoreElStyle(body);
        elWindow.scrollTo(scrollLeft, scrollTop);
      } else {
        restoreElStyle(el);
        Object.assign(el, { scrollTop, scrollLeft });
      }
      lockNumMap.delete(el);
    } else if (num) lockNumMap.set(el, num - 1);
  }

  tryOnScopeDispose(() => {
    localLocks.forEach((e) => unlock(e));
  });
  return [lock, unlock] as const;
}
