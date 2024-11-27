import { createCollector } from '@lun-web/core';
import { ComponentInternalInstance, ComputedRef } from 'vue';
import { getCollectorOptions, Status } from 'common';
import { FormItemProps, RawRule } from './type';

export type FormItemProvideExtra = {
  getValue(vm?: ComponentInternalInstance | null, raw?: boolean): any;
  setValue(vm?: ComponentInternalInstance | null, value?: any, raw?: any): void;
  status: ComputedRef<Status | undefined>;
  validateProps: RawRule;
};

export const FormInputCollector = createCollector<FormItemProps, any, FormItemProvideExtra>(
  getCollectorOptions('form-input', true),
);
