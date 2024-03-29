import { renderElement } from 'utils';
import { Status } from './type';
import { isSupportPopover } from '@lun/utils';

export * from './editStateProps';
export * from './intl';
export * from './propConstructor';
export * from './themeProps';
export * from './transitionProps';
export * from './type';

export const statuses = ['success', 'warning', 'error', 'info'];
const statusSet = new Set(statuses);
export function isStatus(value: string | null | undefined): value is Status {
  return statusSet.has(value!);
}
export function renderStatusIcon(
  status: any,
  iconProps: {
    noCircle?: boolean;
    noAccentColor?: boolean;
    [key: string]: any;
  } = {},
) {
  const { noCircle, noAccentColor, ...others } = iconProps;
  return (
    isStatus(status) &&
    renderElement('icon', {
      'data-status-icon': true,
      [`data-is-status-${status}`]: !noAccentColor,
      name: noCircle ? status + '-no-circle' : status,
      ...others,
    })
  );
}

export const popSupport = {
  popover: isSupportPopover(),
  fixed: true,
  teleport: true,
};
