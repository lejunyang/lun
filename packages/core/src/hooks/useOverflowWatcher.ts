import { ref, watchEffect } from 'vue';
import { isSupportResizeObserver, isOverflow } from '@lun/utils';
import { tryOnScopeDispose } from './lifecycle';
import { MaybeRefLikeOrGetter, unrefOrGet } from '../utils';

export type UseOverflowWatcherOptions = {
  disable?: MaybeRefLikeOrGetter<boolean>;
  elGetter: () => HTMLElement | undefined | null;
  onOverflowChange?: (isOverflow: boolean) => void;
  box?: ResizeObserverBoxOptions;
  getText?: (el: HTMLElement) => string;
};

export function useOverflowWatcher(options: UseOverflowWatcherOptions) {
  const { elGetter, onOverflowChange, box, disable, getText } = options;
  const overflow = ref(false);

  let observer: ResizeObserver | null = null;

  const updateOverflow = () => {
    const el = elGetter();
    if (!el) return;
    const temp = isOverflow(el, { getText });
    if (temp !== overflow.value) {
      overflow.value = temp;
      onOverflowChange && onOverflowChange(temp);
    }
  };

  const clean = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  const stopWatch = watchEffect(() => {
    clean();
    const element = elGetter();
    const disabled = unrefOrGet(disable);
    if (element && isSupportResizeObserver() && !disabled) {
      observer = new ResizeObserver(updateOverflow);
      observer.observe(element, { box });
    }
  });

  const stop = () => {
    stopWatch();
    clean();
  };

  tryOnScopeDispose(stop);

  return {
    isOverflow: overflow,
    stop,
  };
}
