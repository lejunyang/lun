import { createCollector } from '@lun/core';
import type { ComputedRef } from 'vue';
import { CheckboxGroupProps, CheckboxProps } from './type';
import { getCollectorOptions } from 'common';

export const CheckboxCollector = createCollector<
  CheckboxGroupProps,
  CheckboxProps,
  {
    radioState: ComputedRef<{
      allChecked: boolean;
      intermediate: boolean;
      parentValueSet: Set<unknown>;
      isChecked: (value: unknown) => boolean;
    }>;
  }
>(getCollectorOptions('checkbox', false, true));
