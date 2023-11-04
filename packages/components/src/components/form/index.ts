import { createCollector } from '@lun/core';
import { ComputedRef } from 'vue';
import { FormProps } from './type';
import { FormItemProps } from '../form-item';

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
  parent: null as any as FormProps,
  child: null as any as FormItemProps,
  sort: true,
  parentExtra: null as any as FormProvideExtra,
  // TODO getChildEl
});
