import { debounce, toArrayIfNotNil } from '@lun/utils';
import { computed } from 'vue';
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
    return {
      targetFocusThreshold: 20,
      ..._options,
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
        tShow.cancel();
        tHide.cancel();
        show();
      },
      hideNow() {
        tShow.cancel();
        tHide.cancel();
        hide();
      },
    };
  });
  const createTrigger =
    (trigger: PopoverTrigger | null, method: 'show' | 'hide' | 'toggle', extraHandle?: (e: Event) => void | boolean) =>
    (e: Event) => {
      const { triggers, manual, toggleMode, isShow } = options.value;
      if ((!trigger || triggers.has(trigger)) && !manual) {
        if (extraHandle && extraHandle(e) === false) return;
        if (method === 'toggle') {
          if (
            toggleMode &&
            // do hide only when triggers don't have hover or focus, or have focus and target is focused
            !(triggers.has('hover') || (triggers.has('focus') && !targetFocusIn)) &&
            unrefOrGet(isShow)
          ) {
            options.value.hide();
          } else {
            options.value.show();
          }
        } else {
          options.value[method as 'show' | 'hide']();
        }
      }
    };

  let popFocusIn = false,
    targetFocusIn = false,
    targetFocusInTime = 0,
    targetFocusOutTime = 0,
    pointerDownTime = 0,
    active = false;
  const targetHandlers = {
    onMouseenter: createTrigger('hover', 'show'),
    onMouseleave: createTrigger('hover', 'hide', () => !popFocusIn), // if focusing on pop, don't hide when mouse leave
    // need to use pointer down to trigger toggle before focusin
    onPointerdown: createTrigger('click', 'toggle', () => {
      pointerDownTime = Date.now();
      // focusin should be triggered after pointerdown
      // but found an exception... if we focus on target and then focus other place outside viewport(like browser address input or console input), then click target again
      // it will trigger focusin first and then pointerdown, no idea why...
      // so prevent focusin trigger when it's before pointerdown
      const { targetFocusThreshold } = options.value;
      if (pointerDownTime - targetFocusInTime < targetFocusThreshold) return false;
    }),
    onContextmenu: createTrigger('contextmenu', 'show', (e) => {
      e.preventDefault();
    }),
    onFocusin: createTrigger('focus', 'show', () => {
      targetFocusInTime = Date.now();
      targetFocusIn = true;
      // if we click suffix icon when input is focused and toggleMode is true, it will trigger pointerdown(toggle hide) -> focusout -> focusin(show). hide will be canceled
      // so we need a focus threshold to prevent this
      const { targetFocusThreshold } = options.value;
      if (targetFocusInTime - pointerDownTime < targetFocusThreshold) return false;
    }),
    onFocusout: createTrigger('focus', 'hide', () => {
      targetFocusOutTime = Date.now();
      targetFocusIn = false;
      const { targetFocusThreshold } = options.value;
      if (targetFocusOutTime - pointerDownTime < targetFocusThreshold) return false;
      if (active) return false;
    }),
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
    [options.value.target, options.value.pop],
    () => {
      options.value.hide();
      active = false;
    },
    () => {
      const { isShow, manual } = options.value;
      return unrefOrGet(isShow) && !manual;
    },
  );
  return {
    targetHandlers,
    popContentHandlers,
    options,
    cleanup,
  };
}
