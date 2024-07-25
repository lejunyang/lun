import { freeze } from '@lun/utils';
import {
  CommonProps,
  GetEventPropsFromEmits,
  PropFunction,
  PropObjOrBool,
  PropObject,
  PropString,
  Status,
  createTransitionProps,
  themeProps,
} from 'common';
import { ExtractPropTypes } from 'vue';

export const calloutProps = freeze({
  ...themeProps,
  ...createTransitionProps('close'),
  message: {},
  description: {},
  iconName: PropString(),
  iconLibrary: PropString(),
  iconProps: PropObject(),
  /** truthy value to show the close icon, it can also be props of icon  */
  closable: PropObjOrBool(),
  beforeClose: PropFunction<() => boolean | void>(),
  status: PropString<Status>(),
  // TODO add messageStyle descriptionStyle
});

export const calloutEmits = freeze({
  close: null,
  afterClose: null,
});

export type CalloutSetupProps = ExtractPropTypes<typeof calloutProps> & CommonProps;
export type CalloutEvents = GetEventPropsFromEmits<typeof calloutEmits>;
export type CalloutProps = Partial<CalloutSetupProps> & CalloutEvents;
