import { freeze } from '@lun-web/utils';
import {
  CloseEmits,
  CommonProps,
  GetEventMapFromEmits,
  GetEventPropsFromEmits,
  Prop,
  PropFunction,
  PropObjOrBool,
  PropObject,
  PropString,
  Status,
  closeEmits,
  createEmits,
  createTransitionProps,
  themeProps,
} from 'common';
import { ExtractPropTypes } from 'vue';
import { GetCustomRendererSource } from '../custom-renderer';

export const calloutProps = freeze({
  ...themeProps,
  ...createTransitionProps('close'),
  message: Prop<GetCustomRendererSource>(),
  description: Prop<GetCustomRendererSource>(),
  iconName: PropString(),
  iconLibrary: PropString(),
  iconProps: PropObject(),
  /** truthy value to show the close icon, it can also be props of icon  */
  closable: PropObjOrBool(),
  beforeClose: PropFunction<() => boolean | void>(),
  status: PropString<Status>(),
  // TODO add messageStyle descriptionStyle
});

export const calloutEmits = createEmits<CloseEmits>(closeEmits);

export type CalloutSetupProps = ExtractPropTypes<typeof calloutProps> & CommonProps;
export type CalloutEventProps = GetEventPropsFromEmits<typeof calloutEmits>;
export type CalloutEventMap = GetEventMapFromEmits<typeof calloutEmits>;
export type CalloutProps = Partial<CalloutSetupProps> & CalloutEventProps;
