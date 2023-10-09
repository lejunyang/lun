import { isClient } from '@lun/utils';
import { tryOnScopeDispose } from './lifecycle';

export function useClickOutside(targetsGetter: (() => Element | null | undefined)[], callback: (e: Event) => void) {
  if (!isClient()) return;
  const cleanup: (() => void)[] = [];
  const handler = {
    documentClick(e: Event) {
      let target: Element;
      const els = e.composedPath();
      for (let getter of targetsGetter) {
        if (!getter || !(target = getter()!)) continue;
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
