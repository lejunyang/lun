import {
  GetEventPropsFromEmits,
  PropBoolean,
  PropObject,
  PropString,
  Status,
  createTransitionProps,
  themeProps,
} from 'common';
import { ExtractPropTypes } from 'vue';

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
};

export const messageEmits = {
  remove: null,
  afterRemove: null,
};

export type MessageSetupProps = ExtractPropTypes<typeof messageProps>;
export type MessageEvents = GetEventPropsFromEmits<typeof messageEmits>;
export type MessageProps = Partial<MessageSetupProps> & MessageEvents;
