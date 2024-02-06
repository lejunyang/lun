import { GetEventPropsFromEmits, PropBoolean, PropObject, PropString, Status, createTransitionProps, themeProps } from "common";
import { ExtractPropTypes } from "vue";

export const calloutProps = {
  ...themeProps,
  ...createTransitionProps(),
  message: PropString(),
  description: PropString(),
  iconName: PropString(),
  iconLibrary: PropString(),
  iconProps: PropObject(),
  closable: PropBoolean(),
  closeIconProps: PropObject(),
  status: PropString<Status>(),
};

export const calloutEmits = {
  close: null,
  afterClose: null,
};

export type CalloutSetupProps = ExtractPropTypes<typeof calloutProps>;
export type CalloutEvents = GetEventPropsFromEmits<typeof calloutEmits>;
export type CalloutProps = Partial<CalloutSetupProps> & CalloutEvents;