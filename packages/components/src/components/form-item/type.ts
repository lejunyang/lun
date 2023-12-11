import { PropType, ExtractPropTypes } from 'vue';
import { LogicalPosition, PropBoolean, PropNumber, PropString, editStateProps, themeProps } from 'common';
import { MaybePromise } from '@lun/core';

export type Validator = (value: any, data: any, rule: Rule) => MaybePromise<string | string[] | void>;

export const formItemProps = {
  ...editStateProps,
  ...themeProps,
  name: { type: String },
  plainName: PropBoolean(),
  array: PropBoolean(),

  // props for layout
  newLine: PropBoolean(),
  rowSpan: PropNumber(),
  colSpan: PropNumber(),

  // props for extra info
  label: { type: String },
  noLabel: PropBoolean(),
  labelWidth: PropString(),
  labelAlign: PropString<LogicalPosition>(),
  requiredMarkAlign: PropString<LogicalPosition>(),
  colonMark: PropString(),
  requiredMark: PropString(),
  help: { type: String },
  tip: { type: String },
  tooltip: { type: String },

  unmountBehavior: { type: String as PropType<'delete' | 'null' | 'undefined'> },
  deps: { type: [String, Array] as PropType<string | string[]> },
  clearWhenDepChange: PropBoolean(),
  disableWhenDepFalsy: { type: [Boolean, String] as PropType<boolean | 'all' | 'any' | 'none'> },
  // validate props
  type: { type: String }, // can it be auto detected?
  required: PropBoolean(),
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
  greaterThan: { type: [Number, String] },
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
export type Rule = {
  type?: string;
  min?: number;
  max?: number;
  required?: boolean;
  greaterThan?: number;
  lessThan?: number;
  label?: string;
};
// export type ErrorMessageFactory = string | ((args: Record<string, any>) => string);
export type RuleName = 'required' | 'min' | 'max' | 'greaterThan' | 'lessThan';
// export type RuleMessageFactory = Record<RuleName, ErrorMessageFactory>;
