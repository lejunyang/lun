import { createCollector } from '@lun/core';
import { Checkbox } from './Checkbox';
import { CheckboxGroup } from './CheckboxGroup';
import type { ComputedRef } from 'vue';

export * from './Checkbox';
export * from './CheckboxGroup';
export type { CheckboxProps, CheckboxGroupProps, CheckboxOptions, CheckboxUpdateDetail } from './type';

export const CheckboxCollector = createCollector({
  name: 'checkbox',
  parent: CheckboxGroup,
  child: Checkbox,
  onlyForProp: true,
  parentExtra: {
    radioState: null as unknown as ComputedRef<{
      allChecked: boolean;
      intermediate: boolean;
      parentValueSet: Set<unknown>;
    }>,
  },
});
