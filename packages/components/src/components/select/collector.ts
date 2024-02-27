import { createCollector, getHostOfRootShadow, useSelect } from '@lun/core';
import { ComponentInternalInstance } from 'vue';
import { CommonOption } from 'hooks';
import { SelectOptionProps, SelectProps } from './type';

export const SelectCollector = createCollector({
  name: 'select',
  parent: null as any as SelectProps,
  child: null as any as SelectOptionProps,
  sort: true,
  parentExtra: null as any as ReturnType<typeof useSelect> & {
    isHidden: (option: CommonOption) => boolean;
    isActive: (vm: ComponentInternalInstance) => boolean;
    activate: (vm: ComponentInternalInstance) => void;
    deactivate: () => void;
  },
  getChildEl: getHostOfRootShadow,
});
