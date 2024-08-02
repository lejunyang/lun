import { renderElement } from 'utils';
import { Status } from './type';
import { supportPopover } from '@lun/utils';
import { ComponentKey } from 'config';

export * from './editStateProps';
export * from './intl';
export * from './propConstructor';
export * from './themeProps';
export * from './transitionProps';
export * from './type';

export const highlightStatuses = ['error', 'warning'];
export const statuses = [...highlightStatuses, 'success', 'info'];
const statusSet = new Set(statuses),
  hStatusSet = new Set(highlightStatuses);
export function isStatus(value: string | null | undefined): value is Status {
  return statusSet.has(value!);
}
export function isHighlightStatus(value: any) {
  return hStatusSet.has(value);
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
  normal: true,
  teleport: true,
};

export const getCompParts = <N extends ComponentKey, P extends readonly string[]>(name: N, parts: P) =>
  parts.map((p) => `${p} ${name}-${p}`) as {
    [key in keyof P]: `${P[key]} ${N}-${P[key]}`;
  };
