import { PropType, ExtractPropTypes } from 'vue';
import {
  CommonProps,
  GetEventMapFromEmits,
  GetEventPropsFromEmits,
  LogicalPosition,
  PropBoolOrFunc,
  PropBoolean,
  PropFunction,
  PropNumber,
  PropObjOrFunc,
  PropObject,
  PropStrOrArr,
  PropString,
  Status,
  createEmits,
  createTransitionProps,
  editStateProps,
  sizeProp,
  themeProps,
  undefBoolProp,
} from 'common';
import { MaybePromise, CollectorContext, InputType, DatePanelType } from '@lun-web/core';
import { ComponentKey } from 'config';
import { FormProps } from '../form/type';
import { FormProvideExtra } from '../form';
import { freeze } from '@lun-web/utils';

export type ValidatorStatusResult = { status?: Status; message: string };
export type ValidatorResult = string | string[] | ValidatorStatusResult | ValidatorStatusResult[] | undefined | null;

export type Validator = (
  value: any,
  rawValue: any,
  data: any,
  rawData: any,
  rule: Rule,
  rawRule: RawRule,
) => MaybePromise<ValidatorResult>;

export type ValidateTrigger = 'blur' | 'update' | 'depChange' | 'input' | 'change';

export type ValidateMessages = {
  [key in RuleName]?: string | ((args: Rule) => string);
};

export type Condition = 'all-truthy' | 'some-truthy' | 'all-falsy' | 'some-falsy';

export const formItemRuleProps = {
  type: PropString<InputType | DatePanelType>(), // can it be auto detected?
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

export const formItemProps = freeze({
  ...editStateProps,
  ...themeProps,
  name: PropString(),
  plainName: undefBoolProp,
  array: PropBoolean(),

  element: PropString<ComponentKey>(),
  elementProps: PropObjOrFunc<
    object | ((param: { formContext: CollectorContext<any, any, any> | undefined; formItemProps: any }) => any)
  >(),

  /** used to dynamically hide the form-item */
  hideWhen:
    PropFunction<
      (param: { formContext: CollectorContext<any, any, any> | undefined; formItemProps: any }) => boolean
    >(),

  // props for extra info
  label: PropString(),
  noLabel: PropBoolean(),
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
  tipType: PropString<'newLine' | 'tooltip'>(),
  tipShowStatusIcon: undefBoolProp,
  visibleStatuses: PropStrOrArr<Status | Status[]>(),
  maxValidationMsg: PropNumber(),
  ...createTransitionProps('tip'),

  // props for layout
  rowSpan: PropNumber(),
  colSpan: PropNumber(),
  newLine: PropBoolean(),
  endLine: PropBoolean(),
  fullLine: PropBoolean(),
  labelWidth: sizeProp,
  labelAlign: PropString<LogicalPosition>(),
  requiredMarkAlign: PropString<LogicalPosition>(),
  labelWrapperStyle: PropObject(),
  contentWrapperStyle: PropObject(),

  /** used to delete or set current field value null when form-item unmounting */
  unmountBehavior: PropString<'delete' | 'toNull' | 'toUndefined'>(),
  /** used to define the dependencies of current field, changing dependent values will trigger some actions, see `clearWhenDepChange` `disableWhenDepFalsy` `requireWhenDepTruthy` `validateWhen` */
  deps: PropStrOrArr(),
  clearWhenDepChange: undefBoolProp, // must defaults to undefined as used in virtualGetMerge
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
});

export const formItemEmits = createEmits<{
  update: unknown;
}>(['update']);

export type FormItemSetupProps = ExtractPropTypes<typeof formItemProps> & CommonProps;
export type FormItemEventProps = GetEventPropsFromEmits<typeof formItemEmits>;
export type FormItemEventMap = GetEventMapFromEmits<typeof formItemEmits>;
export type FormItemProps = Omit<Partial<FormItemSetupProps>, 'elementProps'> &
  FormItemEventProps & {
    elementProps?:
      | object
      | ((param: {
          formContext: CollectorContext<FormProps, FormItemProps, FormProvideExtra> | undefined;
          formItemProps: FormItemSetupProps;
        }) => any);
  };

export type Rule = {
  type?: InputType | DatePanelType;
  min?: string;
  max?: string;
  required?: string;
  greaterThan?: string;
  lessThan?: string;
  label?: string;
  step?: string;
  precision?: string;
  len?: string;
  pattern?: RegExp | string;
};

export type RawRule = {
  type?: InputType | DatePanelType;
  required?: boolean;
  label?: string;
  min?: any;
  max?: any;
  greaterThan?: any;
  lessThan?: any;
  step?: any;
  precision?: any;
  len?: any;
  pattern?: RegExp | string;
};

export type RuleName = keyof Rule;
