import { createCollector } from '@lun/core';
import { FormItem } from '../form-item/FormItem';
import { Form } from './Form';
import { ComputedRef } from 'vue';
import { FormProps } from './type';

export * from './Form';
export type { FormProps } from './type';

export type FormProvideExtra = {
  formData: ComputedRef<Record<string, any>>;
  getValue: (name: string | string[]) => any;
  setValue: (name: string | string[], value: any) => void;
  formState: {
    errors: any;
    isChanged: boolean;
  };
  formProps: FormProps;
};

export const FormItemCollector = createCollector({
  name: 'FormItem',
  parent: Form,
  child: FormItem,
  sort: true,
  parentExtra: null as any as FormProvideExtra,
  // TODO getChildEl
});
