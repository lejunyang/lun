import { createCollector, useCheckboxMethods, useSelectMethods } from '@lun/core';
import { TreeSetupProps, TreeItemSetupProps } from './type';
import { getCollectorOptions } from 'common';

type c = ReturnType<typeof useCheckboxMethods>;
export const TreeCollector = createCollector<
  TreeSetupProps,
  TreeItemSetupProps,
  {
    select: ReturnType<typeof useSelectMethods>;
    check: c & {
      isIntermediate: (value: any) => boolean;
    };
    expand: {
      isExpanded: c['isChecked'];
      expandAll: c['checkAll'];
      collapseAll: c['uncheckAll'];
      toggleExpand: c['toggle'];
      reverseExpand: c['reverse'];
      expand: c['check'];
      collapse: c['uncheck'];
    };
  },
  true
>({
  ...getCollectorOptions('tree', true),
  tree: true,
});

export type TreeParentContext = ReturnType<(typeof TreeCollector)['parent']>;
