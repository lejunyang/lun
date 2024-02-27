import { createCollector } from '@lun/core';
import type { ComputedRef } from 'vue';
import { CheckboxGroupProps, CheckboxProps } from './type';

export const CheckboxCollector = createCollector({
  name: 'checkbox',
  parent: null as any as CheckboxGroupProps,
  child: null as any as CheckboxProps,
  onlyForProp: true,
  parentExtra: {
    radioState: null as unknown as ComputedRef<{
      allChecked: boolean;
      intermediate: boolean;
      parentValueSet: Set<unknown>;
      isChecked: (value: unknown) => boolean;
    }>,
  },
});
