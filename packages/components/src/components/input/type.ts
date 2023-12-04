import { InputPeriod, InputType } from '@lun/core';
import { ExtractPropTypes, PropType } from 'vue';
import { editStateProps, themeProps } from 'common';

export const baseInputProps = {
  ...editStateProps,
  value: { type: String },
  placeholder: { type: String },
  required: { type: String },
  type: { type: String as PropType<InputType> },
  updateWhen: { type: String as PropType<InputPeriod> },
  debounce: { type: Number },
  throttle: { type: Number },
  waitOptions: { type: Object },
  trim: { type: Boolean, default: true },
  maxLength: { type: Number },
  maxTags: { type: Number },
  restrict: { type: [String, RegExp] },
  restrictWhen: { type: String as PropType<InputPeriod>, default: 'not-composing' },
  toNullWhenEmpty: { type: Boolean, default: true },
  transform: { type: Function as PropType<(value: string | null) => any> },
  transformWhen: { type: String as PropType<InputPeriod>, default: 'not-composing' },
  emitEnterDownWhenComposing: { type: Boolean },
};

export type BaseInputProps = ExtractPropTypes<typeof baseInputProps>;

export const inputProps = {
  ...baseInputProps,
  ...themeProps,
  value: { type: [Array, String] as PropType<string | string[] | null> },
  multiple: { type: Boolean },
  tagRenderer: { type: Function as PropType<(value: string, index: number) => any> },
  tagRendererType: { type: String },
  label: { type: String },
  labelType: { type: String as PropType<'float'> },
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
