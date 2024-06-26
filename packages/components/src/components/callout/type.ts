import { freeze } from '@lun/utils';
import {
  CommonProps,
  GetEventPropsFromEmits,
  PropBoolean,
  PropObject,
  PropString,
  Status,
  createTransitionProps,
  themeProps,
} from 'common';
import { ExtractPropTypes } from 'vue';

export const calloutProps = freeze({
  ...themeProps,
  ...createTransitionProps(),
  message: PropString(Error),
  description: PropString(),
  iconName: PropString(),
  iconLibrary: PropString(),
  iconProps: PropObject(),
  closable: PropBoolean(),
  closeIconProps: PropObject(),
  status: PropString<Status>(),
});

export const calloutEmits = freeze({
  close: null,
  afterClose: null,
});

export type CalloutSetupProps = ExtractPropTypes<typeof calloutProps> & CommonProps;
export type CalloutEvents = GetEventPropsFromEmits<typeof calloutEmits>;
export type CalloutProps = Partial<CalloutSetupProps> & CalloutEvents;
