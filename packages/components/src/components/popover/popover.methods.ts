import { getElementFirstName, getFirstThemeProvider, toElement } from 'utils';
import { iPopover } from './Popover';
import { PopoverProps } from './type';

export function createPopoverInstance({
  to,
  initialProps,
}: { to?: string | Element; initialProps?: PopoverProps } = {}) {
  let target: Element | null | undefined = toElement(to);
  if (!target) target = getFirstThemeProvider();
  const popoverName = getElementFirstName('popover')!;
  if (__DEV__ && !popoverName) throw new Error('popover component is not registered, please register it first.');
  const popover = document.createElement(popoverName) as iPopover;
  const props: PopoverProps = {
    ...initialProps,
    open: false,
  };
  Object.assign(popover, props);
  (target || document.body).appendChild(popover);

  const methods = {
    open(params: PopoverProps = {}) {
      Object.assign(popover, params);
      popover.open = true;
    },
    close() {
      popover.content = undefined;
      popover.open = false;
    },
    destroy() {
      popover.remove();
    },
  };
  return { ...methods, popover };
}
