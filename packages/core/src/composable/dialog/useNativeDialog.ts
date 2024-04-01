import { AnyFn, inBrowser, on } from '@lun/utils';
import { tryOnScopeDispose } from '../../hooks/lifecycle';
import { MaybeRefLikeOrGetter, unrefOrGet } from '../../utils';
import { UseDialogOptions, useDialog } from './useDialog';

export function useNativeDialog(
  options: MaybeRefLikeOrGetter<UseDialogOptions & { native: boolean; escapeClosable?: boolean }, true>,
) {
  const documentHandlers = {
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
    cleanup.push(on(document, 'keydown', documentHandlers.keydown, { capture: true }));
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
