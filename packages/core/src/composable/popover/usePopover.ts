import { debounce, toArrayIfNotNil } from '@lun/utils';
import { computed } from 'vue';
import { useClickOutside } from '../../hooks';
import { MaybeRefLikeOrGetter } from '../../utils';

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
    (trigger: PopoverTrigger | null, method: 'show' | 'hide', extraHandle?: (e: Event) => void | boolean) =>
    (e: Event) => {
      const { triggers, manual } = options.value;
      if ((!trigger || triggers.has(trigger)) && manual === undefined) {
        if (extraHandle && extraHandle(e) === false) return;
        options.value[method]();
      }
    };

  const targetHandler = {
    onMouseenter: createTrigger('hover', 'show'),
    onMouseleave: createTrigger('hover', 'hide'),
    onClick: createTrigger('click', 'show'),
    onContextmenu: createTrigger('contextmenu', 'show', (e) => e.preventDefault()),
    onFocusin: createTrigger('focus', 'show'),
    onFocusout: createTrigger('focus', 'hide'),
  };
  const handlePopShow = createTrigger(null, 'show');
  let popFocusIn = false;
  const popContentHandler = {
    onMouseenter: handlePopShow,
    onMouseleave: createTrigger(null, 'hide', () => !popFocusIn), // if there is a focus in pop, don't hide when mouse leave
    // focusin bubbles, while focus doesn't
    onFocusin: createTrigger(null, 'show', () => {
      popFocusIn = true;
    }),
    onFocusout: createTrigger(null, 'hide', () => {
      popFocusIn = false;
    }),
    // no idea why click dialog after called dialog.show() will trigger focusin and focusout and then dialog disappears. so add onClick to prevent hide
    onClick: handlePopShow,
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
    options,
    cleanup,
  };
}
