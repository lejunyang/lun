import { createCollector } from '@lun/core';
import { Checkbox } from './Checkbox';
import { CheckboxGroup } from './CheckboxGroup';
export * from './Checkbox';
export * from './CheckboxGroup';
import type { ComputedRef } from 'vue';

export const CheckboxCollector = createCollector({
  name: 'checkbox',
  parent: CheckboxGroup,
  child: Checkbox,
  parentExtra: {
    radioState: null as unknown as ComputedRef<{
      allChecked: boolean;
      intermediate: boolean;
      parentValueSet: Set<unknown>;
    }>,
  },
});
