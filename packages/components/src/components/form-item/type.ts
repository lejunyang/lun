import { PropType, ExtractPropTypes, Prop } from 'vue';
import { editStateProps } from 'common';
import { MaybePromise } from '@lun/core';

export type Validator = (rule: any, value: any, data: any) => MaybePromise<string | string[] | void>;

export const formItemProps = {
  ...editStateProps,
  name: { type: String },
  plainName: { type: Boolean },
  array: { type: Boolean },
  label: { type: String },
  noLabel: { type: Boolean },
  markPosition: { type: String as PropType<'start' | 'end' | 'none'> },
  help: { type: String },
  tip: { type: String },
  tooltip: { type: String },
  unmountBehavior: { type: String as PropType<'delete' | 'null' | 'undefined'> },
  deps: { type: [String, Array] as PropType<string | string[]> },
  clearWhenDepChange: { type: Boolean },
  disableWhenDepFalsy: { type: [Boolean, String] as PropType<boolean | 'all' | 'any' | 'none'> },
  // validate props
  type: { type: String }, // can it be auto detected?
  required: { type: Boolean },
  /**
   * to required when deps are required,
   * 'all' means to required when all the deps are required,
   * 'any' means to required when any of deps is required,
   * 'none' means to required when none of deps is required,
   * boolean true equals to 'all'
   **/
  requireWhenDepRequired: { type: [Boolean, String] as PropType<boolean | 'all' | 'any' | 'none'> },
  min: { type: [Number, String] },
  max: { type: [Number, String] },
  moreThan: { type: [Number, String] },
  lessThan: { type: [Number, String] },
  pattern: { type: [RegExp, String] },
  len: { type: [Number, String] },
  /**  */
  step: { type: [Number, String] },
  precision: { type: [Number, String] },
  message: { type: [String, Object] },
  validators: { type: [Array, Function] as PropType<Validator[] | Validator> },
  // TODO extra validate props to input component
};

export type FormItemProps = ExtractPropTypes<typeof formItemProps>;
