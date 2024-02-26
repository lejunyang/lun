import { ExtractPropTypes } from 'vue';
import {
  ThemeVariants,
  editStateProps,
  themeProps,
  LogicalPosition,
  GetEventPropsFromEmits,
  PropString,
  PropFunction,
  PropObject,
  PropObjOrStr,
  PropBoolean,
  PropNumber,
} from 'common';
import { Responsive } from 'hooks';

export const buttonProps = {
  ...editStateProps,
  ...themeProps,
  size: PropObjOrStr<Responsive<'1' | '2' | '3' | '4'>[]>(),
  variant: PropString<ThemeVariants | 'ghost'>(),
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
