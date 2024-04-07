import { UseFormReturn, createCollector, getHostOfRootShadow } from '@lun/core';
import { FormProps, FormSetupProps } from './type';
import { FormItemProps } from '../form-item/type';
import { useTooltipManage } from 'hooks';

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

export const [provideErrorTooltip, useErrorTooltip] = useTooltipManage();
export const [provideHelpTooltip, useHelpTooltip] = useTooltipManage();