import { debounce, toArrayIfNotNil } from '@lun/utils';
import { computed } from 'vue';
import { useClickOutside } from '../../hooks';
import { MaybeRefLikeOrGetter, unrefOrGet } from '../../utils';

export type PopoverTrigger = 'hover' | 'focus' | 'click' | 'contextmenu';

export type UsePopoverOptions = {
  manual?: boolean;
  isShow: MaybeRefLikeOrGetter<boolean>;
  show: () => void;
  hide: () => void;
  target: MaybeRefLikeOrGetter<Element>;
  pop: MaybeRefLikeOrGetter<Element>;
  triggers?: PopoverTrigger | PopoverTrigger[];
  showDelay?: number;
  hideDelay?: number;
  toggleMode?: boolean;
};

export function usePopover(optionsGetter: () => UsePopoverOptions) {
  const options = computed(() => {
    const _options = optionsGetter();
    let { showDelay = 0, hideDelay = 120, show, hide, triggers } = _options;
    const tShow = debounce(show, showDelay),
      tHide = debounce(hide, hideDelay);
    triggers = toArrayIfNotNil(triggers!);
    if (!triggers.length) triggers = ['hover', 'click', 'focus'];
    return {
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
      if ((!trigger || triggers.has(trigger)) && manual === undefined) {
        if (extraHandle && extraHandle(e) === false) return;
        if (method === 'toggle') {
          if (
            toggleMode &&
            // do hide only when triggers don't have hover or focus, or have focus and target is focused
            !(triggers.has('hover') || (triggers.has('focus') && !targetFocusIn)) &&
            unrefOrGet(isShow)
          ) {
            options.value.hide();
          } else options.value.show();
        } else options.value[method as 'show' | 'hide']();
      }
    };

  let popFocusIn = false,
    targetFocusIn = false;
  const targetHandler = {
    onMouseenter: createTrigger('hover', 'show'),
    onMouseleave: createTrigger('hover', 'hide', () => !popFocusIn), // if focusing on pop, don't hide when mouse leave
    onClick: createTrigger('click', 'toggle'),
    onContextmenu: createTrigger('contextmenu', 'toggle', (e) => e.preventDefault()),
    onFocusin: createTrigger('focus', 'show', () => (targetFocusIn = true)),
    onFocusout: createTrigger('focus', 'hide', () => (targetFocusIn = false)),
  };
  const handlePopShow = createTrigger(null, 'show');
  const popContentHandler = {
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
      setTimeout(() => handlePopShow(e));
    },
  };
  // used for dialog, if dialog is close by other ways, we need emit hide instantly
  const dialogHandler = {
    onCancel() {
      options.value.hideNow();
    },
    onClose() {
      options.value.hideNow();
    },
  };
  const cleanup = useClickOutside(
    [options.value.target, options.value.pop],
    () => {
      options.value.hide();
    },
    options.value.isShow
  );
  return {
    targetHandler,
    popContentHandler,
    dialogHandler,
    options,
    cleanup,
  };
}
