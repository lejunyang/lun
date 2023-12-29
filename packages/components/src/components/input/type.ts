import { InputPeriod, InputPeriodWithAuto, InputType } from '@lun/core';
import { ExtractPropTypes } from 'vue';
import {
  GetEventPropsFromEmits,
  PropBoolean,
  PropFunction,
  PropNumber,
  PropObjOrFunc,
  PropStrOrArr,
  PropString,
  editStateProps,
  themeProps,
} from 'common';
import { TagProps } from '../tag/type';

export const baseInputProps = {
  ...editStateProps,
  value: PropString(),
  placeholder: PropString(),
  required: PropString(),
  type: PropString<InputType>(),
  updateWhen: PropStrOrArr<InputPeriodWithAuto | InputPeriodWithAuto[]>(),
  debounce: PropNumber(),
  throttle: PropNumber(),
  waitOptions: {},
  trim: PropBoolean(),
  maxLength: PropNumber(),
  maxTags: PropNumber(),
  restrict: PropString(RegExp),
  restrictWhen: PropStrOrArr<InputPeriod | 'beforeInput' | (InputPeriod | 'beforeInput')[]>(),
  toNullWhenEmpty: PropBoolean(),
  transform: PropFunction<(value: string | null) => any>(),
  transformWhen: PropStrOrArr<InputPeriod | InputPeriod[]>(),
  emitEnterDownWhenComposing: PropBoolean(),
};

export type BaseInputSetupProps = ExtractPropTypes<typeof baseInputProps>;
export type BaseInputProps = Partial<BaseInputSetupProps>;

export const inputProps = {
  ...baseInputProps,
  ...themeProps,
  value: PropStrOrArr(),
  multiple: PropBoolean(),
  /** determines whether to allow duplicate tags when it's multiple input */
  unique: PropBoolean(),
  wrapTags: PropBoolean(),
  tagProps: PropObjOrFunc<((value: any, index: number) => TagProps) | TagProps>(),
  tagRenderer: PropFunction<(value: string, index: number) => any>(),
  tagRendererType: PropString(),
  /** separator used to split current input string when it's multiple input */
  separator: PropString(RegExp),
  label: PropString(),
  labelType: PropString<'float'>(),
  showLengthInfo: PropBoolean(),
  showClearIcon: PropBoolean(),
};

export const inputEmits = {
  update: null,
  enterDown: null,
};

export type InputSetupProps = ExtractPropTypes<typeof inputProps>;
export type InputEvents = GetEventPropsFromEmits<typeof inputEmits>;
export type InputProps = Partial<InputSetupProps> & InputEvents;

export const inputNumberProps = {
  ...inputProps,
  min: PropNumber(),
  max: PropNumber(),
  precision: PropNumber(),
  step: PropNumber(),
  strictStep: { type: Boolean },
  noExponent: { type: Boolean },

  replaceChPeriodMark: { type: Boolean, default: true },
};

export type InputNumberProps = ExtractPropTypes<typeof inputNumberProps>;
