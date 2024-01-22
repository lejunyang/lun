import { PropType, ExtractPropTypes } from 'vue';
import {
  LogicalPosition,
  PropBoolOrFunc,
  PropBoolOrStr,
  PropBoolean,
  PropNumber,
  PropObjOrFunc,
  PropObject,
  PropStrOrArr,
  PropString,
  Status,
  editStateProps,
  themeProps,
} from 'common';
import { MaybePromise, CollectorContext } from '@lun/core';
import { ComponentKey } from 'config';
import { FormProps } from '../form/type';
import { FormProvideExtra } from '../form';

export type Validator = (value: any, data: any, rule: Rule) => MaybePromise<string | string[] | undefined>;

export type ValidateTrigger = 'blur' | 'update' | 'depChange' | 'input' | 'change';

export type ValidateMessages = {
  [key in RuleName]?: string | ((args: Rule) => string);
};

export const formItemProps = {
  ...editStateProps,
  ...themeProps,
  name: PropString(),
  plainName: PropBoolean(),
  array: PropBoolean(),

  element: PropString<ComponentKey>(),
  elementProps: PropObjOrFunc<
    | object
    | ((param: { formContext: CollectorContext<any, any, FormProvideExtra> | undefined; formItemProps: any }) => any)
  >(),

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
  /** used to set tip text for the input, note that if there is any validation error, validation message will take precedence */
  tip: PropString(),
  /** used to set help text for the form-item, help text will always be rendered */
  help: PropString(),
  /**
   * newLine: help text will be rendered in a new line;
   * tooltip: help text will be rendered as content element's tooltip;
   * icon: will render an icon in label, help text will be the icon's tooltip
   */
  helpType: PropString<'newLine' | 'tooltip' | 'icon'>(),
  /** if both helpType and tipType are 'tooltip', show tip as tooltip */
  tipType: PropString<'newLine' | 'tooltip'>(),
  maxValidationMsg: PropNumber(),

  /** used to delete or set current field value null when form-item unmounting */
  unmountBehavior: PropString<'delete' | 'toNull' | 'toUndefined'>(),
  /** used to define the dependencies of current field, changing dependent values will trigger some actions, see `clearWhenDepChange` `disableWhenDepFalsy` `requireWhenDepTruthy` `validateWhen` */
  deps: PropStrOrArr(),
  clearWhenDepChange: PropBoolean(),
  disableWhenDepFalsy: PropBoolOrStr<'all' | 'some' | 'none' | boolean>(),
  // validate props
  type: PropString(), // can it be auto detected?
  required: PropBoolOrFunc<boolean | ((formContext: FormProvideExtra) => boolean | undefined | null)>(),
  /**
   * to required when deps are required,
   * 'all' means to required when all the dep values are truthy,
   * 'some' means to required when some of dep values are truthy,
   * 'none' means to required when none of dep values are truthy,
   * boolean true equals to 'all'
   **/
  requireWhenDepTruthy: PropBoolOrStr<'all' | 'some' | 'none' | boolean>(),
  min: PropNumber(),
  max: PropNumber(),
  greaterThan: PropNumber(),
  lessThan: PropNumber(),
  pattern: PropString(RegExp),
  len: PropNumber(),
  /**  */
  step: PropNumber(),
  precision: PropNumber(),
  message: { type: [String, Object] },
  validators: { type: [Array, Function] as PropType<Validator[] | Validator> },
  validateWhen: PropStrOrArr<ValidateTrigger | ValidateTrigger[]>(),
  revalidateWhen: PropStrOrArr<ValidateTrigger | ValidateTrigger[]>(),
  status: PropString<Status>(),

  validateMessages: PropObject<ValidateMessages>(),
};

export type FormItemSetupProps = ExtractPropTypes<typeof formItemProps>;
export type FormItemProps = Omit<Partial<FormItemSetupProps>, 'elementProps'> & {
  elementProps?:
    | object
    | ((param: {
        formContext: CollectorContext<FormProps, FormItemProps, FormProvideExtra> | undefined;
        formItemProps: FormItemSetupProps;
      }) => any);
};

export type Rule = {
  type?: string;
  min?: number;
  max?: number;
  required?: boolean;
  greaterThan?: number;
  lessThan?: number;
  label?: string;
};

export type RuleName = 'required' | 'min' | 'max' | 'greaterThan' | 'lessThan';

