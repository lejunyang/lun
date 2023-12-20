import { createCollector, useSelect } from '@lun/core';
import { Select } from './Select';
import { SelectOption } from './SelectOption';
import { ComponentInternalInstance, getCurrentInstance, inject, provide } from 'vue';

export * from './Select';
export * from './SelectOptgroup';
export * from './SelectOption';

export * from './type';

export const SelectCollector = createCollector({
  name: 'select',
  parent: Select,
  child: SelectOption,
  parentExtra: null as any as ReturnType<typeof useSelect>,
});

export const SelectOptgroupContext = (() => {
  const key = Symbol(__DEV__ ? 'select-optgroup' : '');
  return {
    provide: () => {
      const vm = getCurrentInstance();
      vm && provide(key, vm);
    },
    inject: () => inject<ComponentInternalInstance>(key),
  };
})();
