import { InputPeriod, InputType, Responsive } from '@lun/core';
import { ExtractPropTypes, PropType } from 'vue';
import { editStateProps } from 'common';

export const baseInputProps = {
  ...editStateProps,
  value: { type: String },
  placeholder: { type: String },
  required: { type: String },
  type: { type: String as PropType<InputType> },
  changeWhen: { type: String as PropType<InputPeriod>, default: 'notComposing' },
  wait: { type: Number },
  waitType: { type: String as PropType<'throttle' | 'debounce'>, default: 'debounce' },
  trim: { type: Boolean, default: true },
  maxLength: { type: Number },
  restrict: { type: [String, RegExp] },
  restrictWhen: { type: String as PropType<InputPeriod>, default: 'notComposing' },
  toNullWhenEmpty: { type: Boolean, default: true },
  transform: { type: Function as PropType<(value: string | null) => any> },
  transformWhen: { type: String as PropType<InputPeriod>, default: 'notComposing' },
  emitEnterDownWhenComposing: { type: Boolean },
};

export type BaseInputProps = ExtractPropTypes<typeof baseInputProps>;

export const inputProps = {
  ...baseInputProps,
  label: { type: String },
  labelType: { type: String as PropType<'float'> },
  size: { type: [String, Object] as PropType<Responsive<'1' | '2' | '3'>>, default: '1' },
  showLengthInfo: { type: Boolean },
  showClearIcon: { type: Boolean },
};

export type InputProps = ExtractPropTypes<typeof inputProps>;

export const inputNumberProps = {
  ...inputProps,
  min: { type: Number },
  max: { type: Number },
  precision: { type: Number },
  step: { type: Number },
  strictStep: { type: Boolean },
  noExponent: { type: Boolean },
  optimizeChPeriodSymbolForNum: { type: Boolean, default: true },
};

export type InputNumberProps = ExtractPropTypes<typeof inputNumberProps>;
