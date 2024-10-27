import { getElementFirstName, getFirstThemeProvider, toElement } from 'utils';
import { iPopover } from './Popover';
import { PopoverProps } from './type';
import { createElement } from '@lun-web/utils';

export function createPopoverInstance({
  to,
  initialProps,
}: { to?: string | Element; initialProps?: PopoverProps } = {}) {
  let target: Element | null | undefined = toElement(to);
  if (!target) target = getFirstThemeProvider();
  const popoverName = getElementFirstName('popover')!;
  if (__DEV__ && !popoverName) throw new Error('popover component is not registered, please register it first.');
  const props: PopoverProps = {
    ...initialProps,
    open: false,
  };
  const popover = createElement(popoverName as any, props as any) as iPopover;
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
