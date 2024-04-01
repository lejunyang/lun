import { AnyFn, inBrowser, on } from '@lun/utils';
import { tryOnScopeDispose } from '../../hooks/lifecycle';
import { unrefOrGet } from '../../utils';
import { UseDialogOptions, useDialog } from './useDialog';

export function useNativeDialog(options: UseDialogOptions & { native: boolean; escapeClosable?: boolean }) {
  const documentHandlers = {
    keydown(e: KeyboardEvent) {
      const { isOpen, native, escapeClosable } = options;
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
      options.close();
    },
    onClose(e: Event) {
      e.preventDefault();
      options.close();
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
