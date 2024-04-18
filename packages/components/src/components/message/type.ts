import { Side } from '@floating-ui/vue';
import { CommonProps, GetEventPropsFromEmits, PropBoolean, PropNumber, PropObjOrStr, PropString, Status, createTransitionProps } from 'common';
import { ExtractPropTypes, HTMLAttributes, ReservedProps } from 'vue';
import { CalloutProps, calloutProps } from '../callout/type';
import { MaybeRefLikeOrGetter } from '@lun/core';
import { freeze } from '@lun/utils';

export const messageProps = freeze({
  ...calloutProps,
  ...createTransitionProps('callout'),
  /** determine the implementation type of popover */
  type: PropString<'popover' | 'position' | 'teleport'>(),
  /** determine the teleport target when 'type' is 'teleport', if it's falsy, it will be the first theme-provider */
  to: PropObjOrStr<MaybeRefLikeOrGetter<string | HTMLElement>>(),
  placement: PropString<Side | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'center'>(),
  /** offset relative to placement side, will not be applied when it's 'center' */
  offset: PropNumber(),
  /** define the common duration, could be number or string 'none'. if duration is 'none' or null, the callout won't be auto closed) */
  duration: PropNumber<number | 'none'>(),
  resetDurationOnHover: PropBoolean(),
});

export const messageEmits = freeze({
  close: null,
  afterClose: null,
});

export type MessageOpenConfig = {
  key?: string | number;
  type?: Status;
  duration?: number | string;
  resetDurationOnHover?: boolean;
} & CalloutProps &
  HTMLAttributes &
  Omit<ReservedProps, 'key'>;

export type MessageSetupProps = ExtractPropTypes<typeof messageProps> & CommonProps;
export type MessageEvents = GetEventPropsFromEmits<typeof messageEmits>;
export type MessageProps = Partial<MessageSetupProps> & MessageEvents;

export type MessageMethods = {
  open(config?: MessageOpenConfig): void;
  close(key: string | number): void;
  closeAll(): void;
};