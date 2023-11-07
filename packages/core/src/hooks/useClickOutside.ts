import { isClient } from '@lun/utils';
import { tryOnScopeDispose } from './lifecycle';
import { MaybeRefLikeOrGetter, unrefOrGet } from '../utils';

export type VirtualElement = {
  getBoundingClientRect: () => DOMRect;
  getClientRects?: () => DOMRectList;
  contextElement?: Element;
};

function isMouseEventInRect(e: MouseEvent, rect: DOMRect) {
  return e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
}

export function useClickOutside(
  targetsGetter: MaybeRefLikeOrGetter<Element | VirtualElement>[],
  callback: (e: Event) => void,
  isOn?: MaybeRefLikeOrGetter<boolean>
) {
  if (!isClient()) return;
  const cleanup: (() => void)[] = [];
  const handler = {
    documentClick(e: MouseEvent) {
      if (isOn !== undefined && !unrefOrGet(isOn)) return; // avoid trigger clickOutSide callback when not show
      let target: Element | VirtualElement;
      const els = e.composedPath();
      for (let getter of targetsGetter) {
        if (!getter || !(target = unrefOrGet(getter)!)) continue;
        if (e.target === target || els.includes(target as any)) return;
        if (isMouseEventInRect(e, target.getBoundingClientRect())) return;
      }
      callback(e);
    },
  };
  document.addEventListener('click', handler.documentClick);
  cleanup.push(() => document.removeEventListener('click', handler.documentClick));

  tryOnScopeDispose(() => {
    cleanup.forEach((i) => i());
  });
  return cleanup;
}
