import { MaybeRefLikeOrGetter, unrefOrGet } from '../../utils';
import { MaybePromise } from '../../hooks';
import { useLockScroll } from './useLockScroll';
import { isFunction, noop } from '@lun/utils';

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
  container?: MaybeRefLikeOrGetter<HTMLElement>;
};

export function useDialog(options: UseDialogOptions) {
  const [requestLock, requestUnlock] = useLockScroll();
  let unlock = noop;
  const lock = () => {
    const el = unrefOrGet(options.container) || document.documentElement;
    requestLock(el);
    unlock = () => requestUnlock(el);
  };

  const methods = {
    open() {
      const { beforeOpen, open, isOpen } = options;
      if (unrefOrGet(isOpen)) return;
      if (isFunction(beforeOpen) && beforeOpen() === false) {
        return;
      }
      lock();
      open();
    },
    async close() {
      const { beforeClose, close, isPending, onPending, isOpen } = options;
      if (unrefOrGet(isPending) || !unrefOrGet(isOpen)) return;
      if (!isFunction(beforeClose)) {
        unlock();
        close();
        return;
      }
      if (onPending) onPending(true);
      return Promise.resolve(beforeClose())
        .then((res) => {
          if (res !== false) {
            unlock();
            close();
          }
        })
        .catch(noop)
        .finally(() => onPending && onPending(false));
    },
    toggle() {
      if (unrefOrGet(options.isOpen)) return methods.close();
      else methods.open();
    },
    async ok() {
      const { beforeOk, isPending, onPending } = options;
      if (unrefOrGet(isPending)) return;
      if (!beforeOk) return methods.close();
      if (onPending) onPending(true);
      return Promise.resolve(beforeOk())
        .then((res) => {
          if (res !== false) methods.close();
        })
        .catch(noop)
        .finally(() => onPending && onPending(false));
    },
  };
  const maskHandlers = {
    onClick() {
      const { maskClosable } = options;
      if (maskClosable === 'click' || maskClosable === true) {
        methods.close();
      }
    },
    onDblclick() {
      if (options.maskClosable === 'dblclick') {
        methods.close();
      }
    },
  };
  return { methods, maskHandlers };
}
