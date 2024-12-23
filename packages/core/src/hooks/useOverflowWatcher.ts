import { watchEffect } from 'vue';
import { isElement, isSupportResizeObserver, isTextOverflow } from '@lun-web/utils';
import { tryOnScopeDispose } from './lifecycle';
import { MaybeRefLikeOrGetter, unrefOrGet } from '../utils';
import { PopoverAttachTargetOptions } from '../composable';
import { useRefSet, useRefWeakMap } from './state';

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
    [getOverflowState, setOverflowState, deleteOverflowState] = useRefWeakMap<Element, boolean>(),
    openSet = useRefSet<Element>(),
    [, addOpenEl, deleteOpenEl, clearOpenEl] = openSet;

  let observer: ResizeObserver | null = null;

  const updateOverflow: ResizeObserverCallback = (entries) => {
    for (const e of entries) {
      const { target } = e;
      const options = targetOptionMap.get(target);
      const { isDisabled, overflow } = options || {};
      if (unrefOrGet(isDisabled)) {
        deleteOverflowState(target);
        deleteOpenEl(target);
        continue;
      }
      const temp = isTextOverflow(target as HTMLElement, options),
        original = getOverflowState(target);
      if (temp !== original) {
        setOverflowState(target, temp);
        if (temp && unrefOrGet(overflow) === 'open') addOpenEl(target);
        else deleteOpenEl(target);
        onOverflowChange?.({ target, isOverflow: temp });
      }
    }
  };

  const clean = () => {
    clearOpenEl();
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
    deleteOverflowState(el);
    deleteOpenEl(el);
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
        return getOverflowState(el) || false;
      },
    },
    targetOptionMap,
    /** A set contains overflowing elements with overflow option 'open' */
    openSet,
  };
}
