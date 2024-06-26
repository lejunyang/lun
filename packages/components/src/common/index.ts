import { renderElement } from 'utils';
import { Status } from './type';
import { supportPopover } from '@lun/utils';

export * from './editStateProps';
export * from './intl';
export * from './propConstructor';
export * from './themeProps';
export * from './transitionProps';
export * from './type';
export * from './exportParts';

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
  let { noCircle, noAccentColor, name, ...others } = iconProps;
  name = isStatus(status) ? status : name;
  return (
    name &&
    renderElement('icon', {
      'data-status-icon': isStatus(status),
      [`data-${name}-color`]: !noAccentColor,
      name: noCircle ? status + '-no-circle' : name,
      ...others,
    })
  );
}

export const popSupport = {
  popover: supportPopover,
  position: true,
  teleport: true,
};
