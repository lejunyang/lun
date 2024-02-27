import { MaybeRefLikeOrGetter, unrefOrGet } from '../../utils';
import { MaybePromise } from '../../hooks';

export type UseDialogOptions = {
  isOpen: MaybeRefLikeOrGetter<boolean>;
  beforeOpen?: () => void | boolean;
  open: () => void;
  beforeClose?: () => MaybePromise<boolean | void>;
  close: () => void;
  beforeOk?: () => MaybePromise<boolean | void>;
  isPending?: MaybeRefLikeOrGetter<boolean>;
  onPending?: (pending: boolean) => void;
  maskClosable?: boolean | 'click' | 'dblclick';
};

export function useDialog(options: MaybeRefLikeOrGetter<UseDialogOptions, true>) {
  const methods = {
    open() {
      const { beforeOpen, open } = unrefOrGet(options);
      if (beforeOpen && beforeOpen() === false) {
        return;
      }
      open();
    },
    async close() {
      const { beforeClose, close, isPending, onPending, isOpen } = unrefOrGet(options);
      if (unrefOrGet(isPending) || !unrefOrGet(isOpen)) return;
      if (!beforeClose) {
        close();
        return;
      }
      if (onPending) onPending(true);
      return Promise.resolve(beforeClose())
        .then((res) => {
          if (res !== false) {
            close();
          }
        })
        .catch(() => {})
        .finally(() => onPending && onPending(false));
    },
    toggle() {
      if (unrefOrGet(unrefOrGet(options).isOpen)) return methods.close();
      else methods.open();
    },
    async ok() {
      const { beforeOk, isPending, onPending } = unrefOrGet(options);
      if (unrefOrGet(isPending)) return;
      if (!beforeOk) return methods.close();
      if (onPending) onPending(true);
      return Promise.resolve(beforeOk())
        .then((res) => {
          if (res !== false) methods.close();
        })
        .catch(() => {})
        .finally(() => onPending && onPending(false));
    },
  };
  const maskHandlers = {
    onClick() {
      const { maskClosable } = unrefOrGet(options);
      if (maskClosable === 'click' || maskClosable === true) {
        methods.close();
      }
    },
    onDblclick() {
      if (unrefOrGet(options).maskClosable === 'dblclick') {
        methods.close();
      }
    },
  };
  return { methods, maskHandlers };
}
