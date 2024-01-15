import { ExtractPropTypes } from 'vue';
import {
  GetEventPropsFromEmits,
  editStateProps,
  themeProps,
  emitConstructor,
  PropObjOrFunc,
  PropObject,
  PropBoolean,
  PropString,
  PropNumber,
} from 'common';
import { CollectorContext, UseFormReturn } from '@lun/core';
import { FormItemSetupProps, Validator } from '../form-item/type';
import { FormProvideExtra } from '.';

export interface FormValidators {
  [key: string]: Validator[] | Validator | FormValidators;
}

export const formProps = {
  ...editStateProps,
  ...themeProps,
  // no idea why prop `form` will be considered as a string attribute, use `formManager` instead
  formManager: PropObject<UseFormReturn>(),
  defaultFormData: PropObject(),
  defaultFormState: PropObject(),
  /** determine whether the name of current form-item is plain or not, plain means the name will be considered as a single string path, will not try transform it into nested path */
  plainName: PropBoolean(),
  validators: PropObject<FormValidators>(),
  /**
   * determine the validate early stop strategy.
   * If it's 'first', then stop validating when first error occurs;
   * 'form-item' is similar to 'first', but it will finish all validators of the same form-item
   */
  stopValidate: PropString<'first' | 'form-item'>(),
  scrollToFirstError: PropBoolean(),

  layout: PropString<'flex' | 'grid' | 'inline-flex' | 'inline-grid'>(),
  labelWidth: PropString(),
  cols: PropNumber(),

  itemProps: PropObjOrFunc<
    | Partial<FormItemSetupProps>
    | ((params: {
        formContext: CollectorContext<any, FormItemSetupProps, FormProvideExtra> | undefined;
        formItemProps: FormItemSetupProps;
      }) => Partial<FormItemSetupProps>)
  >(),
};

export const formEmits = {
  update: emitConstructor<{ formData: Record<string, any>; path: string[] | string; value: any; isDelete?: boolean }>(),
};

export type FormSetupProps = ExtractPropTypes<typeof formProps>;
export type FormEvents = GetEventPropsFromEmits<typeof formEmits>;
export type FormProps = Partial<FormSetupProps> & FormEvents;
