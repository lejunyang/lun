import { createCollector, getHostOfRootShadow } from '@lun/core';
import { FormItem } from './FormItem';
import { ComponentInternalInstance, ComputedRef } from 'vue';
import { Status } from 'common';
import { Rule } from './type';

export * from './FormItem';
export type { FormItemProps } from './type';

export type FormItemProvideExtra = {
  getValue(vm?: ComponentInternalInstance | null): any;
  setValue(vm?: ComponentInternalInstance | null, value?: any): void;
  status: ComputedRef<Status | undefined>;
  validateProps: ComputedRef<Rule>;
};

export const FormInputCollector = createCollector({
  name: 'FormInput',
  parent: FormItem,
  sort: true,
  parentExtra: null as any as FormItemProvideExtra,
  getChildEl: getHostOfRootShadow,
});
