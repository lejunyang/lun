import { createCollector, getHostOfRootShadow } from '@lun/core';
import { ComponentInternalInstance, ComputedRef } from 'vue';
import { Status } from 'common';
import { FormItemProps, Rule } from './type';

export type FormItemProvideExtra = {
  getValue(vm?: ComponentInternalInstance | null): any;
  setValue(vm?: ComponentInternalInstance | null, value?: any, raw?: any): void;
  status: ComputedRef<Status | undefined>;
  validateProps: ComputedRef<Rule>;
};

export const FormInputCollector = createCollector({
  name: 'FormInput',
  parent: null as any as FormItemProps,
  sort: true,
  parentExtra: null as any as FormItemProvideExtra,
  getChildEl: getHostOfRootShadow,
});
