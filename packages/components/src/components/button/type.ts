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
  CommonProps,
} from 'common';
import { freeze } from '@lun/utils';

export const buttonProps = freeze({
  ...editStateProps,
  ...themeProps,
  block: PropBoolean(),
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
});

export const buttonEmits = freeze({ validClick: null, timeout: null });

export type ButtonSetupProps = ExtractPropTypes<typeof buttonProps> & CommonProps;
export type ButtonEvents = GetEventPropsFromEmits<typeof buttonEmits>;
export type ButtonProps = Partial<ButtonSetupProps> & ButtonEvents;
