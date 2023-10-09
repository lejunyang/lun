import { debounce, toArrayIfNotNil } from '@lun/utils';
import { computed } from 'vue';
import { useClickOutside } from '../../hooks';

export type PopoverTrigger = 'hover' | 'focus' | 'click' | 'contextmenu';

export type UsePopoverOptions = {
  show: () => void;
  hide: () => void;
  targetGetter: () => Element | undefined | null;
  popGetter: () => Element | undefined | null;
  placement?:
    | 'top'
    | 'left'
    | 'right'
    | 'bottom'
    | 'topLeft'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomRight'
    | 'leftTop'
    | 'leftBottom'
    | 'rightTop'
    | 'rightBottom';
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
    (trigger: PopoverTrigger, method: 'show' | 'hide', extraHandle?: (e: Event) => void) => (e: Event) => {
      const { triggers } = options.value;
      if (triggers.has(trigger)) {
        if (extraHandle) extraHandle(e);
        options.value[method]();
      }
    };
  const onMouseenter = createTrigger('hover', 'show');
  const onMouseleave = createTrigger('hover', 'hide');
  const onClick = createTrigger('click', 'show');
  const onContextmenu = createTrigger('contextmenu', 'show', (e) => e.preventDefault());
  const onFocusin = createTrigger('focus', 'show');
  const onFocusout = createTrigger('focus', 'hide');
  const targetHandler = {
    onMouseenter,
    onMouseleave,
    onClick,
    onContextmenu,
    onFocusin,
    onFocusout,
  };
  const popContentHandler = {
    onMouseenter,
    onMouseleave,
    onFocusin,
    onFocusout,
  };
  const cleanup = useClickOutside([options.value.targetGetter, options.value.popGetter], () => {
    options.value.hide();
  });
  return {
    targetHandler,
    popContentHandler,
    options,
    cleanup,
  };
}
