import { Side } from '@floating-ui/vue';
import { GetEventPropsFromEmits, PropBoolean, PropNumber, PropString, Status, createTransitionProps } from 'common';
import { ExtractPropTypes, HTMLAttributes, ReservedProps } from 'vue';
import { CalloutProps, calloutProps } from '../callout/type';

export const messageProps = {
  ...calloutProps,
  ...createTransitionProps('callout'),
  /** determine the implementation type of popover */
  type: PropString<'popover' | 'fixed' | 'teleport'>(),
  /** determine the teleport target when 'type' is 'teleport', default to 'body' */
  to: PropString(),
  placement: PropString<Side | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'center'>(),
  /** define the common duration, could be number or string 'none'. if duration is 'none' or null, the callout won't be auto closed) */
  duration: PropNumber<number | 'none'>(),
  resetDurationOnHover: PropBoolean(),
};

export const messageEmits = {
  close: null,
  afterClose: null,
};

export type MessageOpenConfig = {
  key?: string | number;
  type?: Status;
  duration?: number | string;
  resetDurationOnHover?: boolean;
} & CalloutProps &
  HTMLAttributes &
  Omit<ReservedProps, 'key'>;

export type MessageSetupProps = ExtractPropTypes<typeof messageProps>;
export type MessageEvents = GetEventPropsFromEmits<typeof messageEmits>;
export type MessageProps = Partial<MessageSetupProps> & MessageEvents;
