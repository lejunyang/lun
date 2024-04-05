import {
  debounce,
  isElement,
  toArrayIfNotNil,
  on,
  off,
  noop,
  isEditElement,
  getDeepestActiveElement,
} from '@lun/utils';
import { computed, ref } from 'vue';
import { VirtualElement, tryOnScopeDispose, useClickOutside } from '../../hooks';
import { MaybeRefLikeOrGetter, unrefOrGet } from '../../utils';

export type PopoverTrigger = 'hover' | 'focus' | 'edit' | 'click' | 'contextmenu';

export type UsePopoverOptions = {
  manual?: boolean;
  isShow: MaybeRefLikeOrGetter<boolean>;
  open: () => void;
  close: () => void;
  target: MaybeRefLikeOrGetter<Element | VirtualElement>;
  pop: MaybeRefLikeOrGetter<Element>;
  triggers?: PopoverTrigger | PopoverTrigger[];
  openDelay?: number | string;
  closeDelay?: number | string;
  toggleMode?: boolean;
  targetFocusThreshold?: number;
  // TODO add focusPrior to prevent switching targets
};

export function usePopover(optionsGetter: () => UsePopoverOptions) {
  const options = computed(() => {
    const _options = optionsGetter();
    let { openDelay = 0, closeDelay = 120, open, close, triggers } = _options;
    const tOpen = debounce(open, openDelay),
      tClose = debounce(close, closeDelay);
    triggers = toArrayIfNotNil(triggers!);
    if (!triggers.length) triggers = ['hover', 'click', 'edit'];
    const cancelOpenOrClose = () => {
      tOpen.cancel();
      tClose.cancel();
    };
    return {
      targetFocusThreshold: 20,
      ..._options,
      openDelay,
      closeDelay: +closeDelay,
      cancelOpenOrClose,
      triggers: new Set<PopoverTrigger>(triggers),
      open() {
        tClose.cancel();
        tOpen();
      },
      close() {
        tOpen.cancel();
        tClose();
      },
      openNow() {
        cancelOpenOrClose();
        open();
      },
      closeNow() {
        cancelOpenOrClose();
        close();
      },
    };
  });

  /** create a event handler representing a pop trigger with action method */
  const createTrigger =
    (
      trigger: PopoverTrigger | null,
      method: 'open' | 'close' | 'toggle',
      extraHandle?: (e: Event, actualMethod: 'open' | 'close') => void | boolean,
    ) =>
    (e: Event) => {
      const { triggers, manual, toggleMode, isShow } = options.value;
      // 'edit' same as 'focus'
      if ((!trigger || triggers.has(trigger) || (trigger === 'focus' && triggers.has('edit'))) && !manual) {
        const actualMethod = method === 'toggle' ? (toggleMode && unrefOrGet(isShow) ? 'close' : 'open') : method;
        if (extraHandle && extraHandle(e, actualMethod) === false) return;
        options.value[actualMethod]();
      }
    };

  let popFocusIn = false,
    ignoreTargetFocusout = false;
  /** focusing elements inside popover target, or popover target itself */
  const focusSet = new WeakSet<EventTarget>();

  // ------------------ extra targets ------------------
  // it's to support attaching events of triggering popover on other elements in an imperative manner
  const extraTargetsMap = ref(new Map<Element, ReturnType<typeof createTargetHandlers>>()),
    extraTargetsDisabledMap = new WeakMap<Element, MaybeRefLikeOrGetter<boolean> | undefined>();
  const activeTargetInExtra = ref();
  const methods = {
    attachTarget(target?: Element, { isDisabled }: { isDisabled?: MaybeRefLikeOrGetter<boolean> } = {}) {
      if (!isElement(target) || extraTargetsMap.value.has(target)) return;
      const targetHandlers = createTargetHandlers((_e, method) => {
        if (method === 'open') {
          if (unrefOrGet(extraTargetsDisabledMap.get(target))) return false;
          activeTargetInExtra.value = target;
        }
        // no need to clear activeTarget when close, as every open will reset activeTarget
      });
      extraTargetsMap.value.set(target, targetHandlers);
      extraTargetsDisabledMap.set(target, isDisabled);
      for (let [key, handler] of Object.entries(targetHandlers)) {
        on(target, key.slice(2).toLowerCase(), handler);
      }
    },
    detachTarget(target?: Element) {
      if (!isElement(target)) return;
      const targetHandlers = extraTargetsMap.value.get(target);
      if (!targetHandlers) return;
      for (let [key, handler] of Object.entries(targetHandlers)) {
        off(target, key.slice(2).toLowerCase(), handler);
      }
      extraTargetsMap.value.delete(target);
      extraTargetsDisabledMap.delete(target);
    },
  };
  tryOnScopeDispose(() => {
    for (const target of extraTargetsMap.value.keys()) {
      methods.detachTarget(target);
    }
    extraTargetsMap.value.clear();
  });
  // ------------------ extra targets ------------------

  /** determine whether to prevent closing pop content when has focus */
  const needPrevent = (e: Event) => {
    const { triggers } = options.value;
    return (
      (popFocusIn || focusSet.has(e.target!)) &&
      (triggers.has('focus') || (triggers.has('edit') && isEditElement(getDeepestActiveElement())))
    );
  };

  const createTargetHandlers = (onTrigger: (e: Event, actualMethod: 'open' | 'close') => void | boolean = noop) => {
    let targetFocusInTime = 0,
      targetFocusOutTime = 0,
      pointerDownTime = 0;
    const targetHandlers = {
      onMouseenter: createTrigger('hover', 'open', onTrigger),
      onMouseleave: createTrigger('hover', 'close', (e, m) => {
        return !needPrevent(e) && onTrigger(e, m) !== false;
      }),
      // need to use pointer down to trigger toggle before focusin
      onPointerdown: createTrigger('click', 'toggle', (e, m) => {
        pointerDownTime = e.timeStamp;
        // focusin should be triggered after pointerdown
        // but found an exception... if we focus on target and then focus other place outside viewport(like browser address input or console input), then click target again
        // it will fire focusin first and then pointerdown, no idea why...
        // so prevent focusin firing when it's before pointerdown
        const { targetFocusThreshold } = options.value;
        if (pointerDownTime - targetFocusInTime < targetFocusThreshold) return false;
        return onTrigger(e, m);
      }),
      onContextmenu: createTrigger('contextmenu', 'open', (e, m) => {
        e.preventDefault();
        return onTrigger(e, m);
      }),
      onFocusin: createTrigger('focus', 'open', (e, m) => {
        targetFocusInTime = e.timeStamp;
        focusSet.add(e.target!);
        focusSet.add(e.currentTarget!); // also consider the popover target itself focusing, so that we can prevent close when mouse leave

        // if we click suffix icon when input is focused and toggleMode is true, it will fire pointerdown(toggle close) -> focusout -> focusin(open). close will be canceled
        // so we need a focus threshold to prevent this
        const { targetFocusThreshold } = options.value;
        if (targetFocusInTime - pointerDownTime < targetFocusThreshold) return false;
        return onTrigger(e, m);
      }),
      onFocusout: createTrigger('focus', 'close', (e, m) => {
        targetFocusOutTime = e.timeStamp;
        focusSet.delete(e.target!);
        focusSet.delete(e.currentTarget!);
        const { targetFocusThreshold } = options.value;
        if (ignoreTargetFocusout || targetFocusOutTime - pointerDownTime < targetFocusThreshold) return false;
        return onTrigger(e, m);
      }),
    };
    return targetHandlers;
  };

  const handlePopShow = createTrigger(null, 'open');
  const popContentHandlers = {
    onMouseenter: handlePopShow,
    onMouseleave: createTrigger('hover', 'close', (e) => {
      return !needPrevent(e);
    }),
    // focusin bubbles, while focus doesn't
    onFocusin: createTrigger(null, 'open', () => {
      popFocusIn = true;
    }),
    onFocusout: createTrigger(null, 'close', () => {
      popFocusIn = false;
    }),
    // need use pointerdown instead of click, because if we press the pop content and don't release, popover target will fire focusout and then close, click will not be triggered on pop content
    onPointerdown(e: Event) {
      ignoreTargetFocusout = true;
      setTimeout(() => {
        handlePopShow(e);
      });
    },
  };

  const cleanup = useClickOutside(
    computed(() =>
      // Array.from(extraTargetsMap.value.keys()).concat(options.value.target as any, options.value.pop as any),
      [activeTargetInExtra.value, options.value.target, options.value.pop],
    ),
    () => {
      options.value.close();
      ignoreTargetFocusout = false;
    },
    () => {
      const { isShow, manual } = options.value;
      return unrefOrGet(isShow) && !manual;
    },
  );
  cleanup.push(() => extraTargetsMap.value.clear());
  return {
    targetHandlers: createTargetHandlers((_, method) => {
      if (method === 'open') activeTargetInExtra.value = null;
    }),
    popContentHandlers,
    options,
    cleanup,
    methods,
    activeTargetInExtra,
  };
}
