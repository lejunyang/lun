import { createCollector } from '@lun/core';
import { FormItem } from '../form-item/FormItem';
import { Form } from './Form';

export * from './Form';
export type { FormProps } from './type';

type FormProvideExtra = {
  formData: Record<string, any>;
  getValue: (name: string) => any;
  formState: {
    errors: any;
    isChanged: boolean;
  };
};

export const FormItemCollector = createCollector({
  name: 'FormItem',
  parent: Form,
  child: FormItem,
  sort: true,
  parentExtra: null as any as FormProvideExtra,
});
