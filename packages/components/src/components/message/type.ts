import { Side } from '@floating-ui/vue';
import {
  CommonProps,
  GetEventMapFromEmits,
  GetEventPropsFromEmits,
  OpenCloseEmits,
  PropBoolean,
  PropNumber,
  PropObjOrStr,
  PropString,
  Status,
  createEmits,
  createTransitionProps,
  openCloseEmits,
} from 'common';
import { ExtractPropTypes, HTMLAttributes } from 'vue';
import { CalloutProps, calloutProps } from '../callout/type';
import { MaybeRefLikeOrGetter } from '@lun-web/core';
import { freeze } from '@lun-web/utils';

export const messageProps = freeze({
  ...calloutProps,
  ...createTransitionProps('close', 'callout'),
  /** determine the implementation type of popover */
  type: PropString<'popover' | 'normal' | 'teleport'>(),
  /** determine the teleport target when 'type' is 'teleport', if it's falsy, it will be the first theme-provider */
  to: PropObjOrStr<MaybeRefLikeOrGetter<string | HTMLElement>>(),
  placement: PropString<Side | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'center'>(),
  /** offset relative to placement side, will not be applied when it's 'center' */
  offset: PropNumber(),
  /** define the common duration, could be number or string 'none'. if duration is 'none' or null, the callout won't be auto closed) */
  duration: PropNumber<number | 'none'>(),
  resetDurationOnHover: PropBoolean(),
});

export const messageEmits = createEmits<
  OpenCloseEmits & {
    allClosed: undefined;
  }
>([...openCloseEmits, 'allClosed']);

export type MessageOpenConfig = {
  key?: string | number;
  type?: Status;
  duration?: number | string;
  resetDurationOnHover?: boolean;
} & CalloutProps &
  MessageEventProps &
  HTMLAttributes;

export type MessageSetupProps = ExtractPropTypes<typeof messageProps> & CommonProps;
export type MessageEventProps = GetEventPropsFromEmits<typeof messageEmits>;
export type MessageEventMap = GetEventMapFromEmits<typeof messageEmits>;
export type MessageProps = Partial<MessageSetupProps> & MessageEventProps;

export type MessageMethods = {
  open(config?: MessageOpenConfig): string;
  close(key: string | number): void;
  closeAll(): void;
};
