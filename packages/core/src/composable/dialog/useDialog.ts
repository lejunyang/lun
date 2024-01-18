import { MaybeRefLikeOrGetter, unrefOrGet } from '../../utils';
import { MaybePromise } from '../../hooks';

export type UseNativeDialogOptions = {
  isOpen: boolean | undefined;
  beforeOpen?: () => void | boolean;
  open: () => void;
  beforeClose?: () => MaybePromise<boolean | void>;
  close: () => void;
  beforeOk?: () => MaybePromise<boolean | void>;
  isPending?: boolean;
  onPending?: (pending: boolean) => void;
  escapeClosable?: boolean;
};

export function useDialog(options: MaybeRefLikeOrGetter<UseNativeDialogOptions, true>) {
  const methods = {
    open() {
      const { beforeOpen, open } = unrefOrGet(options)!;
      if (beforeOpen && beforeOpen() === false) {
        return;
      }
      open();
    },
    async close() {
      const { beforeClose, close, isPending, onPending, isOpen } = unrefOrGet(options)!;
      if (isPending || !isOpen) return;
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
      if (unrefOrGet(options)?.isOpen) methods.close();
      else methods.open();
    },
    async ok() {
      const { beforeOk, isPending, onPending } = unrefOrGet(options)!;
      if (isPending) return;
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
  return methods;
}
