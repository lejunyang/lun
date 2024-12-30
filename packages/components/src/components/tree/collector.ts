import { createCollector, UseSelectMethods, UseCheckboxMethods, UseExpandMethods } from '@lun-web/core';
import { TreeSetupProps, TreeItemSetupProps } from './type';
import { getCollectorOptions } from 'common';

export type TreeExtraProvide = {
  select: UseSelectMethods;
  check: UseCheckboxMethods & {
    isIntermediate: (value: any) => boolean;
  };
  expand: UseExpandMethods;
};
export const TreeCollector = createCollector<TreeSetupProps, TreeItemSetupProps, TreeExtraProvide, true>({
  ...getCollectorOptions('tree', true, true),
  tree: true,
});

export type TreeParentContext = ReturnType<(typeof TreeCollector)['parent']>;
