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
  Prop,
  createEmits,
  GetEventMapFromEmits,
} from 'common';
import { freeze } from '@lun-web/utils';
import { MaybeRefLikeOrGetter } from '@lun-web/core';

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
  /** if specified, value will be copied to clipboard when button is clicked */
  copyText: Prop<MaybeRefLikeOrGetter<string>>(),
});

export const buttonEmits = createEmits<{
  validClick: undefined;
  timeout: undefined;
  copySuccess: undefined;
  copyFail: Error | undefined;
}>(['validClick', 'timeout', 'copySuccess', 'copyFail']);

export type ButtonSetupProps = ExtractPropTypes<typeof buttonProps> & CommonProps;
export type ButtonEventProps = GetEventPropsFromEmits<typeof buttonEmits>;
export type ButtonEventMap = GetEventMapFromEmits<typeof buttonEmits>;
export type ButtonProps = Partial<ButtonSetupProps> & ButtonEventProps;
