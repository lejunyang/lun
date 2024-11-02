import { Ref } from 'vue';
import { iPopover } from '../components/popover/Popover';
import { isConnected } from '@lun-web/utils';

/** default scrollIntoViewIfNeed */
export function scrollIntoView(el: Element, options?: ScrollIntoViewOptions) {
  return el.scrollIntoView({ block: 'nearest', ...options });
}

export function openPopover(elRef: Ref<iPopover | HTMLElement | undefined>) {
  const { value } = elRef,
    k = 'openPopover';
  // check isConnected because of message component, this might be called on disconnected element
  if (isConnected(value)) k in value ? (value as iPopover)[k]() : value.showPopover();
}

export function closePopover(elRef: Ref<iPopover | HTMLElement | undefined>, delay?: boolean, ensure?: boolean) {
  const { value } = elRef;
  const key = delay ? 'delayClosePopover' : `closePopover`;
  if (isConnected(value)) key in value ? (value as iPopover)[key](ensure) : value.hidePopover();
}
