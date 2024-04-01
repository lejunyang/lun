import { debounce, isElement, toArrayIfNotNil, on, off } from '@lun/utils';
import { computed, ref } from 'vue';
import { VirtualElement, useClickOutside } from '../../hooks';
import { MaybeRefLikeOrGetter, unrefOrGet } from '../../utils';

export type PopoverTrigger = 'hover' | 'focus' | 'click' | 'contextmenu';

export type UsePopoverOptions = {
  manual?: boolean;
  isShow: MaybeRefLikeOrGetter<boolean>;
  show: () => void;
  hide: () => void;
  target: MaybeRefLikeOrGetter<Element | VirtualElement>;
  pop: MaybeRefLikeOrGetter<Element>;
  triggers?: PopoverTrigger | PopoverTrigger[];
  openDelay?: number | string;
  closeDelay?: number | string;
  toggleMode?: boolean;
  targetFocusThreshold?: number;
};

export function usePopover(optionsGetter: () => UsePopoverOptions) {
  const options = computed(() => {
    const _options = optionsGetter();
    let { openDelay = 0, closeDelay = 120, show, hide, triggers } = _options;
    const tShow = debounce(show, openDelay),
      tHide = debounce(hide, closeDelay);
    triggers = toArrayIfNotNil(triggers!);
    if (!triggers.length) triggers = ['hover', 'click', 'focus'];
    const cancelShowOrHide = () => {
      tShow.cancel();
      tHide.cancel();
    };
    return {
      targetFocusThreshold: 20,
      ..._options,
      cancelShowOrHide,
      triggers: new Set<PopoverTrigger>(triggers),
      show() {
        tHide.cancel();
        tShow();
      },
      hide() {
        tShow.cancel();
        tHide();
      },
      showNow() {
        cancelShowOrHide();
        show();
      },
      hideNow() {
        cancelShowOrHide();
        hide();
      },
    };
  });
  const createTrigger =
    (
      trigger: PopoverTrigger | null,
      method: 'show' | 'hide' | 'toggle',
      extraHandle?: (e: Event, actualMethod: 'show' | 'hide') => void | boolean,
    ) =>
    (e: Event) => {
      const { triggers, manual, toggleMode, isShow } = options.value;
      if ((!trigger || triggers.has(trigger)) && !manual) {
        const actualMethod =
          method === 'toggle'
            ? toggleMode &&
              // when it's toggle, do hide only when triggers don't have hover or focus, or have focus and target is focused
              !(triggers.has('hover') || (triggers.has('focus') && !focusInTargetSet.has(e.target!))) &&
              unrefOrGet(isShow)
              ? 'hide'
              : 'show'
            : method;
        if (extraHandle && extraHandle(e, actualMethod) === false) return;
        options.value[actualMethod]();
      }
    };

  let popFocusIn = false,
    active = false;
  const focusInTargetSet = new WeakSet<EventTarget>();

  // ------------------ extra targets ------------------
  // it's to support attaching events of triggering popover on other elements in an imperative manner
  const extraTargetsMap = ref(new Map<Element, ReturnType<typeof createTargetHandlers>>());
  const activeTargetInExtra = ref();
  const methods = {
    attachTarget(target?: Element) {
      if (!isElement(target)) return;
      const targetHandlers = createTargetHandlers((_e, method) => {
        if (method === 'show') activeTargetInExtra.value = target;
        else activeTargetInExtra.value = null; // maybe need to defer clear activeTarget(setTimeout, clearTimeout), as clear activeTarget will make Popover anchor CE, so the pop content will still be shown for a while
      });
      extraTargetsMap.value.set(target, targetHandlers);
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
    },
  };
  // ------------------ extra targets ------------------

  const createTargetHandlers = (onTrigger: (e: Event, actualMethod: 'show' | 'hide') => void = () => null) => {
    let targetFocusInTime = 0,
      targetFocusOutTime = 0,
      pointerDownTime = 0;
    const targetHandlers = {
      onMouseenter: createTrigger('hover', 'show', onTrigger),
      onMouseleave: createTrigger('hover', 'hide', (e, m) => {
        !popFocusIn && onTrigger(e, m);
        return !popFocusIn;
      }), // if focusing on pop, don't hide when mouse leave
      // need to use pointer down to trigger toggle before focusin
      onPointerdown: createTrigger('click', 'toggle', (e, m) => {
        pointerDownTime = Date.now();
        // focusin should be triggered after pointerdown
        // but found an exception... if we focus on target and then focus other place outside viewport(like browser address input or console input), then click target again
        // it will trigger focusin first and then pointerdown, no idea why...
        // so prevent focusin trigger when it's before pointerdown
        const { targetFocusThreshold } = options.value;
        if (pointerDownTime - targetFocusInTime < targetFocusThreshold) return false;
        onTrigger(e, m);
      }),
      onContextmenu: createTrigger('contextmenu', 'show', (e, m) => {
        e.preventDefault();
        onTrigger(e, m);
      }),
      onFocusin: createTrigger('focus', 'show', (e, m) => {
        targetFocusInTime = Date.now();
        focusInTargetSet.add(e.target!);
        // if we click suffix icon when input is focused and toggleMode is true, it will trigger pointerdown(toggle hide) -> focusout -> focusin(show). hide will be canceled
        // so we need a focus threshold to prevent this
        const { targetFocusThreshold } = options.value;
        if (targetFocusInTime - pointerDownTime < targetFocusThreshold) return false;
        onTrigger(e, m);
      }),
      onFocusout: createTrigger('focus', 'hide', (e, m) => {
        targetFocusOutTime = Date.now();
        focusInTargetSet.delete(e.target!);
        const { targetFocusThreshold } = options.value;
        if (targetFocusOutTime - pointerDownTime < targetFocusThreshold) return false;
        if (active) return false;
        onTrigger(e, m);
      }),
    };
    return targetHandlers;
  };

  const handlePopShow = createTrigger(null, 'show');
  const popContentHandlers = {
    onMouseenter: handlePopShow,
    onMouseleave: createTrigger('hover', 'hide', () => {
      return !popFocusIn;
    }),
    // focusin bubbles, while focus doesn't
    onFocusin: createTrigger(null, 'show', (e) => {
      // found that if dialog shows and is clicked, close it, and then move mouse over the target, would also trigger dialog focusin
      // need exclude if it's dialog
      if ((e.target as Element).tagName !== 'DIALOG') popFocusIn = true;
    }),
    onFocusout: createTrigger(null, 'hide', (e) => {
      if ((e.target as Element).tagName !== 'DIALOG') popFocusIn = false;
    }),
    // no idea why click dialog after called dialog.show() will trigger focusin and focusout and then dialog disappears. so add onClick to prevent hide
    // onClick: handlePopShow,
    // need use pointerdown instead of click, because if we press the pop and don't release, target will trigger focusout and hide, click will not be triggered on pop
    onPointerdown(e: Event) {
      active = true;
      setTimeout(() => {
        handlePopShow(e);
      });
    },
  };

  const cleanup = useClickOutside(
    computed(() =>
      Array.from(extraTargetsMap.value.keys()).concat(options.value.target as any, options.value.pop as any),
    ),
    () => {
      options.value.hide();
      active = false;
    },
    () => {
      const { isShow, manual } = options.value;
      return unrefOrGet(isShow) && !manual;
    },
  );
  cleanup.push(() => extraTargetsMap.value.clear());
  return {
    targetHandlers: createTargetHandlers(),
    popContentHandlers,
    options,
    cleanup,
    methods,
    activeTargetInExtra,
  };
}
