import { inBrowser, on, prevent } from '@lun-web/utils';
import { tryOnScopeDispose } from '../../hooks/lifecycle';
import { unrefOrGet } from '../../utils';
import { UseDialogOptions, useDialog } from './useDialog';

export function useNativeDialog(options: UseDialogOptions & { native: boolean; escapeClosable?: boolean }) {
  const documentHandlers = {
    keydown(e: KeyboardEvent) {
      const { isOpen, native, escapeClosable } = options;
      if (e.key === 'Escape' && unrefOrGet(isOpen)) {
        if (native) prevent(e);
        if (escapeClosable) methods.close();
      }
    },
  };
  const { methods, maskHandlers } = useDialog(options);
  const dialogHandlers = {
    onCancel(e: Event) {
      prevent(e);
      options.close();
    },
    onClose(e: Event) {
      prevent(e);
      options.close();
    },
  };

  if (inBrowser) {
    tryOnScopeDispose(on(document, 'keydown', documentHandlers.keydown, { capture: true }));
  }

  return {
    methods,
    dialogHandlers,
    maskHandlers,
  };
}
