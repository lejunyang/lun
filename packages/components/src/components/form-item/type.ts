import { PropType, ExtractPropTypes, Prop } from 'vue';
import { editStateProps } from 'common';

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
  deps: { type: [String, Array] as PropType<string | string[]> },
  clearWhenDepChange: { type: Boolean },
  disableWhenDepClear: { type: Boolean },
  /** 
   * to required when deps are required,
   * 'all' means to required when all the deps are required,
   * 'any' means to required when any of deps is required,
   * 'none' means to required when none of deps is required,
   * boolean true equals to 'all'
   **/
  requiredAsDep: { type: [Boolean, String] as PropType<boolean | 'all' | 'any' | 'none'> },
  // validate props
  type: { type: String }, // can it be auto detected?
  required: { type: Boolean },
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
  // TODO extra validate props to input component
};

export type FormItemProps = ExtractPropTypes<typeof formItemProps>;
