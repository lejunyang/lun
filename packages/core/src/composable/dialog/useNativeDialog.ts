import { AnyFn, inBrowser } from '@lun/utils';
import { tryOnScopeDispose } from '../../hooks/lifecycle';
import { MaybeRefLikeOrGetter, unrefOrGet } from '../../utils';
import { UseDialogOptions, useDialog } from './useDialog';

export function useNativeDialog(
  options: MaybeRefLikeOrGetter<UseDialogOptions & { native: boolean; escapeClosable?: boolean }, true>,
) {
  const documentHandlers = {
    // click(_e: MouseEvent) {},
    // dblclick(_e: MouseEvent) {},
    keydown(e: KeyboardEvent) {
      const { isOpen, native, escapeClosable } = unrefOrGet(options)!;
      if (e.key === 'Escape' && unrefOrGet(isOpen)) {
        if (native) e.preventDefault();
        if (escapeClosable) methods.close();
      }
    },
  };
  const { methods, maskHandlers } = useDialog(options);
  const dialogHandlers = {
    onCancel(e: Event) {
      e.preventDefault();
      unrefOrGet(options)?.close();
    },
    onClose(e: Event) {
      e.preventDefault();
      unrefOrGet(options)?.close();
    },
  };

  const cleanup: AnyFn[] = [];
  if (inBrowser) {
    // document.addEventListener('click', documentHandlers.click);
    // document.addEventListener('dblclick', documentHandlers.dblclick);
    document.addEventListener('keydown', documentHandlers.keydown, { capture: true });
    // cleanup.push(() => document.removeEventListener('click', documentHandlers.click));
    // cleanup.push(() => document.removeEventListener('dblclick', documentHandlers.dblclick));
    cleanup.push(() => document.removeEventListener('keydown', documentHandlers.keydown, { capture: true }));
  }

  tryOnScopeDispose(() => {
    cleanup.forEach((f) => f());
  });

  return {
    methods,
    dialogHandlers,
    maskHandlers,
  };
}
