import { freeze } from '@lun-web/utils';

export const createEmits = <EventParams extends Record<string, any>>(events: string[]) =>
  freeze(events) as unknown as {
    [key in keyof EventParams]-?: EventParams[key] extends undefined ? () => void : (payload: EventParams[key]) => void;
  };

export const closeEmits = ['close', 'afterClose'];
export type CloseEmits = {
  close: undefined;
  afterClose: undefined;
};
export const openCloseEmits = ['open', 'afterOpen', ...closeEmits];
export type OpenCloseEmits = {
  open: undefined;
  afterOpen: undefined;
} & CloseEmits;
