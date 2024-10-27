import { reactive, watchEffect } from 'vue';
import { isElement, isSupportResizeObserver, isTextOverflow } from '@lun-web/utils';
import { tryOnScopeDispose } from './lifecycle';
import { MaybeRefLikeOrGetter, unrefOrGet } from '../utils';
import { PopoverAttachTargetOptions } from '../composable';

export type UseOverflowWatcherOptions = {
  isDisabled?: MaybeRefLikeOrGetter<boolean>;
  onOverflowChange?: (param: { isOverflow: boolean; target: Element }) => void;
  box?: ResizeObserverBoxOptions;
  onAttach?: (el: Element, options?: UseOverflowWatcherAttachOptions) => void;
  onDetach?: (el: Element) => void;
};

export type UseOverflowWatcherAttachOptions = Parameters<typeof isTextOverflow>[1] &
  PopoverAttachTargetOptions & {
    overflow?: MaybeRefLikeOrGetter<'enable' | 'open'>;
  };

export function useOverflowWatcher(options: UseOverflowWatcherOptions) {
  const { onOverflowChange, box, isDisabled, onAttach, onDetach } = options;
  const targetOptionMap = new WeakMap<Element, UseOverflowWatcherAttachOptions | undefined>(),
    overflowStateMap = reactive(new WeakMap<Element, boolean>()),
    openSet = reactive(new Set<Element>());

  let observer: ResizeObserver | null = null;

  const updateOverflow: ResizeObserverCallback = (entries) => {
    for (const e of entries) {
      const { target } = e;
      const options = targetOptionMap.get(target);
      const { isDisabled, overflow } = options || {};
      if (unrefOrGet(isDisabled)) {
        overflowStateMap.delete(target);
        openSet.delete(target);
        continue;
      }
      const temp = isTextOverflow(target as HTMLElement, options),
        original = overflowStateMap.get(target);
      if (temp !== original) {
        overflowStateMap.set(target, temp);
        if (temp && unrefOrGet(overflow) === 'open') openSet.add(target);
        else openSet.delete(target);
        onOverflowChange?.({ target, isOverflow: temp });
      }
    }
  };

  const clean = () => {
    openSet.clear();
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  const init = () => {
    clean();
    const disabled = unrefOrGet(isDisabled);
    if (isSupportResizeObserver() && !disabled) {
      observer = new ResizeObserver(updateOverflow);
    }
  };
  const stopWatch = watchEffect(init);

  const attachTarget = (el: Element, options?: UseOverflowWatcherAttachOptions) => {
    if (!isElement(el)) return;
    if (!observer) init();
    if (observer && options?.overflow && !targetOptionMap.has(el)) {
      targetOptionMap.set(el, options);
      observer.observe(el, { box });
    }
    onAttach?.(el, options);
  };

  const detachTarget = (el: Element) => {
    if (!isElement(el)) return;
    if (observer) observer.unobserve(el);
    targetOptionMap.delete(el);
    overflowStateMap.delete(el);
    openSet.delete(el);
    onDetach?.(el);
  };

  const stop = () => {
    stopWatch();
    clean();
  };

  tryOnScopeDispose(stop);

  return {
    methods: {
      stop,
      attachTarget,
      detachTarget,
      isOverflow(el: any) {
        return overflowStateMap.get(el) || false;
      },
    },
    targetOptionMap,
    /** A set contains overflowing elements with overflow option 'open' */
    openSet,
  };
}
