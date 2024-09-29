import { createCollector, useSelectMethods } from '@lun/core';
import { ComponentInternalInstance } from 'vue';
import { CommonProcessedOption } from 'hooks';
import { TreeSetupProps, TreeItemSetupProps } from './type';
import { getCollectorOptions } from 'common';

export const TreeCollector = createCollector<
  TreeSetupProps,
  TreeItemSetupProps,
  ReturnType<typeof useSelectMethods> & {
    isHidden: (option: CommonProcessedOption) => boolean;
    isActive: (vm: ComponentInternalInstance) => boolean;
    activate: (vm: ComponentInternalInstance) => void;
    deactivate: () => void;
  },
  true
>({
  ...getCollectorOptions('tree', true),
  tree: true,
});
