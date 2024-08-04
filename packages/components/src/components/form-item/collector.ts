import { createCollector } from '@lun/core';
import { ComponentInternalInstance, ComputedRef } from 'vue';
import { getCollectorOptions, Status } from 'common';
import { FormItemProps, Rule } from './type';

export type FormItemProvideExtra = {
  getValue(vm?: ComponentInternalInstance | null): any;
  setValue(vm?: ComponentInternalInstance | null, value?: any, raw?: any): void;
  status: ComputedRef<Status | undefined>;
  validateProps: ComputedRef<Rule>;
};

export const FormInputCollector = createCollector<FormItemProps, any, FormItemProvideExtra>(
  getCollectorOptions('form-input', true),
);
