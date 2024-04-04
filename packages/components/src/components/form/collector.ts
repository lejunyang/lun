import { UseFormReturn, createCollector, getHostOfRootShadow } from '@lun/core';
import { FormProps, FormSetupProps } from './type';
import { FormItemProps } from '../form-item/type';
import { iTooltip } from '../tooltip';
import { Ref } from 'vue';

export type FormProvideExtra = {
  form: UseFormReturn;
  formProps: FormSetupProps;
  elTooltipMap: WeakMap<HTMLElement, () => any>;
  tooltipRef: Ref<iTooltip>;
};

export const FormItemCollector = createCollector({
  name: 'FormItem',
  parent: null as any as FormProps,
  child: null as any as FormItemProps,
  sort: true,
  parentExtra: null as any as FormProvideExtra,
  getChildEl: getHostOfRootShadow,
});
