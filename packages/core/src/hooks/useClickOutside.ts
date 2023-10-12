import { isClient } from '@lun/utils';
import { tryOnScopeDispose } from './lifecycle';
import { MaybeRefLikeOrGetter, unrefOrGet } from '../utils';

export function useClickOutside(
  targetsGetter: MaybeRefLikeOrGetter<Element>[],
  callback: (e: Event) => void,
  isOn?: MaybeRefLikeOrGetter<boolean>
) {
  if (!isClient()) return;
  const cleanup: (() => void)[] = [];
  const handler = {
    documentClick(e: Event) {
      if (isOn !== undefined && !unrefOrGet(isOn)) return; // avoid trigger clickOutSide callback when not show
      let target: Element;
      const els = e.composedPath();
      for (let getter of targetsGetter) {
        if (!getter || !(target = unrefOrGet(getter)!)) continue;
        if (e.target === target || els.includes(target)) return;
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
