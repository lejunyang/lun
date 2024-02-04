import { Status } from './type';

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
