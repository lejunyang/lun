import { createCollector } from '@lun-web/core';
import { CheckboxGroupProps, CheckboxProps } from './type';
import { getCollectorOptions } from 'common';

export const CheckboxCollector = createCollector<
  CheckboxGroupProps,
  CheckboxProps,
  {
    radioState: {
      allChecked: boolean;
      intermediate: boolean;
      parentValueSet: Set<unknown>;
      isChecked: (value: unknown) => boolean;
    };
  }
>(getCollectorOptions('checkbox', false, false, true));
