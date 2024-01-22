import { UseFormReturn, createCollector, getHostOfRootShadow } from '@lun/core';
import { FormProps, FormSetupProps } from './type';
import { FormItemProps } from '../form-item';

export * from './Form';
export type { FormProps } from './type';

export type FormProvideExtra = {
  form: UseFormReturn;
  formProps: FormSetupProps;
};

export const FormItemCollector = createCollector({
  name: 'FormItem',
  parent: null as any as FormProps,
  child: null as any as FormItemProps,
  sort: true,
  parentExtra: null as any as FormProvideExtra,
  getChildEl: getHostOfRootShadow,
});
