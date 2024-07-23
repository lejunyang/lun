import { Ref } from 'vue';
import { iPopover } from '../components/popover/Popover';

/** default scrollIntoViewIfNeed */
export function scrollIntoView(el: Element, options?: ScrollIntoViewOptions) {
  return el.scrollIntoView({ block: 'nearest', ...options });
}

export function openPopover(elRef: Ref<iPopover | HTMLElement | undefined>) {
  const { value } = elRef,
    k = 'openPopover';
  if (value) k in value ? (value as iPopover)[k]() : value.showPopover();
}

export function closePopover(elRef: Ref<iPopover | HTMLElement | undefined>, delay?: boolean, ensure?: boolean) {
  const { value } = elRef;
  const key = delay ? 'delayClosePopover' : `closePopover`;
  if (value) key in value ? (value as iPopover)[key](ensure) : value.hidePopover();
}
