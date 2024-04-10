import { ExtractPropTypes } from 'vue';
import {
  editStateProps,
  themeProps,
  LogicalPosition,
  GetEventPropsFromEmits,
  PropString,
  PropFunction,
  PropObject,
  PropBoolean,
  PropNumber,
  PropResponsive,
} from 'common';

export const buttonProps = {
  ...editStateProps,
  ...themeProps,
  size: PropResponsive<'1' | '2' | '3' | '4'>(),
  label: PropString(),
  asyncHandler: PropFunction<(e?: MouseEvent) => void>(),
  spinProps: PropObject(),
  showLoading: PropBoolean(),
  iconPosition: PropString<LogicalPosition>(),
  debounce: PropNumber(),
  throttle: PropNumber(),
  hold: PropNumber(),
  iconName: PropString(),
  iconLibrary: PropString(),
};

export const buttonEmits = { validClick: null };

export type ButtonSetupProps = ExtractPropTypes<typeof buttonProps>;
export type ButtonEvents = GetEventPropsFromEmits<typeof buttonEmits>;
export type ButtonProps = Partial<ButtonSetupProps> & ButtonEvents;
