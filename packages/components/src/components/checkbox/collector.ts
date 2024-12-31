import { createCollector, useCheckboxMethods } from '@lun-web/core';
import { CheckboxGroupProps, CheckboxProps } from './type';
import { getCollectorOptions } from 'common';

export const CheckboxCollector = createCollector<
  CheckboxGroupProps,
  CheckboxProps,
  ReturnType<typeof useCheckboxMethods>
>(getCollectorOptions('checkbox', false, false, true));
