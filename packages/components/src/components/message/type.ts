import { Side } from '@floating-ui/vue';
import {
  GetEventPropsFromEmits,
  PropBoolean,
  PropObject,
  PropString,
  Status,
  createTransitionProps,
  themeProps,
} from 'common';
import { ExtractPropTypes, HTMLAttributes, ReservedProps } from 'vue';
import { CalloutProps } from '../callout/type';

export const messageProps = {
  ...themeProps,
  ...createTransitionProps(),
  /** determine the implementation type of popover */
  type: PropString<'popover' | 'fixed' | 'teleport'>(),
  /** determine the teleport target when 'type' is 'teleport', default to 'body' */
  to: PropString(),
  message: PropString(),
  description: PropString(),
  iconName: PropString(),
  iconLibrary: PropString(),
  iconProps: PropObject(),
  removable: PropBoolean(),
  removeIconProps: PropObject(),
  status: PropString<Status>(),

  placement: PropString<Side | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'center'>(),
};

export const messageEmits = {
  close: null,
  afterClose: null,
};

export type MessageOpenConfig = {
  key?: string | number;
  type?: Status;
  duration?: number;
  resetDurationOnHover?: boolean;
} & CalloutProps &
  HTMLAttributes &
  Omit<ReservedProps, 'key'>;

export type MessageSetupProps = ExtractPropTypes<typeof messageProps>;
export type MessageEvents = GetEventPropsFromEmits<typeof messageEmits>;
export type MessageProps = Partial<MessageSetupProps> & MessageEvents;
