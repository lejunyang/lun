import { createCollector, getHostOfRootShadow, useSelectMethods } from '@lun/core';
import { ComponentInternalInstance } from 'vue';
import { CommonProcessedOption } from 'hooks';
import { SelectOptionProps, SelectProps } from './type';

export const SelectCollector = createCollector({
  name: 'select',
  parent: null as any as SelectProps,
  child: null as any as SelectOptionProps,
  sort: true,
  parentExtra: null as any as ReturnType<typeof useSelectMethods> & {
    isHidden: (option: CommonProcessedOption) => boolean;
    isActive: (vm: ComponentInternalInstance) => boolean;
    activate: (vm: ComponentInternalInstance) => void;
    deactivate: () => void;
  },
  getChildEl: getHostOfRootShadow,
});
