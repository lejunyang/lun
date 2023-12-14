import { PropType, ExtractPropTypes } from 'vue';
import { LogicalPosition, PropBoolean, PropNumber, PropObject, PropString, editStateProps, themeProps } from 'common';
import { MaybePromise } from '@lun/core';
import { ComponentKey } from 'config';

export type Validator = (value: any, data: any, rule: Rule) => MaybePromise<string | string[] | void>;

export const formItemProps = {
  ...editStateProps,
  ...themeProps,
  name: PropString(),
  plainName: PropBoolean(),
  array: PropBoolean(),

  element: PropString<ComponentKey>(),
  elementProps: PropObject(),

  // props for layout
  rowSpan: PropNumber(),
  colSpan: PropNumber(),
  newLine: PropBoolean(),
  fullLine: PropBoolean(),
  labelWrapperStyle: PropObject(),
  contentWrapperStyle: PropObject(),

  // props for extra info
  label: PropString(),
  noLabel: PropBoolean(),
  labelWidth: PropString(),
  labelAlign: PropString<LogicalPosition>(),
  requiredMarkAlign: PropString<LogicalPosition>(),
  colonMark: PropString(),
  requiredMark: PropString(),
  help: PropString(),
  tip: PropString(),
  tooltip: PropString(),

  unmountBehavior: PropString<'delete' | 'null' | 'undefined'>(),
  deps: { type: [String, Array] as PropType<string | string[]> },
  clearWhenDepChange: PropBoolean(),
  disableWhenDepFalsy: { type: [Boolean, String] as PropType<boolean | 'all' | 'any' | 'none'> },
  // validate props
  type: PropString(), // can it be auto detected?
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

export type FormItemSetupProps = ExtractPropTypes<typeof formItemProps>;
export type FormItemProps = Partial<FormItemSetupProps>; 

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
