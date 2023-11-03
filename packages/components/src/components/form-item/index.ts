import { createCollector } from '@lun/core';
import { FormItem } from './FormItem';
import { ComponentInternalInstance } from 'vue';

export * from './FormItem';
export type { FormItemProps } from './type';

export type FormItemProvideExtra = {
  getValue(vm?: ComponentInternalInstance | null): any;
  setValue(vm?: ComponentInternalInstance | null, value?: any): void;
};

export const FormInputCollector = createCollector({
  name: 'FormInput',
  parent: FormItem,
  sort: true,
  parentExtra: null as any as FormItemProvideExtra,
  // TODO getChildEl
});
