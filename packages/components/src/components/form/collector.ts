import { UseFormReturn, createCollector } from '@lun/core';
import { FormProps, FormSetupProps } from './type';
import { FormItemProps } from '../form-item/type';
import { useTooltipManage } from 'hooks';
import { ComputedRef } from 'vue';
import { getCollectorOptions } from 'common';

export type FormProvideExtra = {
  form: UseFormReturn;
  formProps: FormSetupProps;
  layoutInfo: ComputedRef<{
    isGrid: boolean;
    isFlex: boolean;
    hasLabel: boolean;
    formStyle: Record<string, any>;
    itemState: Record<string, any>;
    getItemStyles: (params: {
      fullLine?: boolean;
      newLine?: boolean;
      endLine?: boolean;
      rowSpan?: string | number;
      colSpan?: string | number;
      labelWidth?: string;
    }) => {
      hostStyle: string;
      rootStyle: Record<string, any>;
      labelStyle: Record<string, any>;
      contentStyle: Record<string, any>;
    };
  }>;
};

export const FormItemCollector = createCollector<FormProps, FormItemProps, FormProvideExtra>(
  getCollectorOptions('form', true),
);

export const [provideErrorTooltip, useErrorTooltip] = useTooltipManage();
export const [provideHelpTooltip, useHelpTooltip] = useTooltipManage();
