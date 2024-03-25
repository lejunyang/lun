import { PropType, ExtractPropTypes } from 'vue';
import {
  GetEventPropsFromEmits,
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
import { MaybePromise, CollectorContext, InputType } from '@lun/core';
import { ComponentKey } from 'config';
import { FormProps } from '../form/type';
import { FormProvideExtra } from '../form';

export type Validator = (value: any, data: any, rule: Rule) => MaybePromise<string | string[] | undefined>;

export type ValidateTrigger = 'blur' | 'update' | 'depChange' | 'input' | 'change';

export type ValidateMessages = {
  [key in RuleName]?: string | ((args: Rule) => string);
};

export type Condition = 'all-truthy' | 'some-truthy' | 'all-falsy' | 'some-falsy';

export const formItemRuleProps = {
  type: PropString<InputType>(), // can it be auto detected?
  required: PropBoolOrFunc<boolean | ((formContext: FormProvideExtra) => boolean | undefined | null)>(),
  min: PropNumber(),
  max: PropNumber(),
  greaterThan: PropNumber(),
  lessThan: PropNumber(),
  pattern: PropString(RegExp),
  len: PropNumber(),
  step: PropNumber(),
  precision: PropNumber(),
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
  disableWhenDep: PropStrOrArr<Condition>(),
  // ------------------ validation ------------------
  ...formItemRuleProps,
  /**
   * to required when deps match some conditions,
   * 'all-truthy' means to required when all the dep values are truthy,
   * 'some-truthy' means to required when some of dep values are truthy,
   * 'all-falsy' means to required when all the dep values are falsy,
   * 'some-falsy' means to required when some of dep values are falsy
   **/
  requireWhenDep: PropStrOrArr<Condition>(),
  validators: { type: [Array, Function] as PropType<Validator[] | Validator> },
  validateWhen: PropStrOrArr<ValidateTrigger | ValidateTrigger[]>(),
  revalidateWhen: PropStrOrArr<ValidateTrigger | ValidateTrigger[]>(),
  status: PropString<Status>(),

  validateMessages: PropObject<ValidateMessages>(),
};

export const formItemEmits = {
  update: (_val: any) => null,
};

export type FormItemSetupProps = ExtractPropTypes<typeof formItemProps>;
export type FormItemEvents = GetEventPropsFromEmits<typeof formItemEmits>;
export type FormItemProps = Omit<Partial<FormItemSetupProps>, 'elementProps'> &
  FormItemEvents & {
    elementProps?:
      | object
      | ((param: {
          formContext: CollectorContext<FormProps, FormItemProps, FormProvideExtra> | undefined;
          formItemProps: FormItemSetupProps;
        }) => any);
  };

export type Rule = {
  type?: InputType;
  min?: number;
  max?: number;
  required?: boolean;
  greaterThan?: number;
  lessThan?: number;
  label?: string;
  step?: number;
  precision?: number;
  len?: number;
  pattern?: RegExp | string;
};

export type RuleName = keyof Rule;
