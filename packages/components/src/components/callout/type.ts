import { GetEventPropsFromEmits, PropBoolean, PropObject, PropString, createTransitionProps, themeProps } from "common";
import { ExtractPropTypes } from "vue";

export const calloutProps = {
  ...themeProps,
  ...createTransitionProps(),
  message: PropString(),
  description: PropString(),
  iconName: PropString(),
  iconLibrary: PropString(),
  iconProps: PropObject(),
  removable: PropBoolean(),
  removeIconProps: PropObject(),
};

export const calloutEmits = {
  remove: null,
  afterRemove: null,
};

export type CalloutSetupProps = ExtractPropTypes<typeof calloutProps>;
export type CalloutEvents = GetEventPropsFromEmits<typeof calloutEmits>;
export type CalloutProps = Partial<CalloutSetupProps> & CalloutEvents;