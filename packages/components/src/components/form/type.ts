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
import { FormItemSetupProps, ValidateMessages, Validator } from '../form-item/type';
import { FormProvideExtra } from '.';

export interface FormValidators {
  [key: string]: Validator[] | Validator | FormValidators;
}

export const formProps = {
  ...editStateProps,
  ...themeProps,
  // intent to use prop `form` originally, but found `form` will be considered as a string attribute. It's vue's behavior, see vuejs/core/packages/runtime-dom/src/patchProp.ts. use `instance` instead
  instance: PropObject<UseFormReturn>(),
  defaultFormData: PropObject(),
  defaultFormState: PropObject(),
  /**
   * determine whether the name of form-items of current form are plain or not, plain means the name will be considered as a single string path, will not try transform it into nested path
   * prop `plainName` of form-item itself takes higher priority
   */
  plainName: PropBoolean(),
  validators: PropObject<FormValidators>(),
  /**
   * determine the validate early stop strategy.
   * if it's 'first', then stop validating when first error occurs;
   * 'form-item' is similar to 'first', but it will finish all validators of the same form-item
   */
  stopValidate: PropString<'first' | 'form-item'>(),
  scrollToFirstError: PropBoolean(),
  validateMessages: PropObject<ValidateMessages>(),

  layout: PropString<'flex' | 'grid' | 'inline-flex' | 'inline-grid'>(),
  labelLayout: PropString<'horizontal' | 'vertical'>(),
  labelWidth: PropString(),
  cols: PropNumber(),
  // TODO responsive props for above four

  /**
   * set common props for children form-items.
   * note that 'deps' prop will be ignored, as it's commonly set on form-item itself
   */
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
export type FormProps = Omit<Partial<FormSetupProps>, 'itemProps'> & {
  itemProps?:
    | Partial<Omit<FormItemSetupProps, 'deps'>>
    | ((params: {
        formContext: CollectorContext<FormSetupProps, FormItemSetupProps, FormProvideExtra> | undefined;
        formItemProps: FormItemSetupProps;
      }) => Partial<Omit<FormItemSetupProps, 'deps'>>);
} & FormEvents;
