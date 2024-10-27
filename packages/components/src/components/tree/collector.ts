import { createCollector, useCheckboxMethods, useSelectMethods } from '@lun-web/core';
import { TreeSetupProps, TreeItemSetupProps } from './type';
import { getCollectorOptions } from 'common';

type c = ReturnType<typeof useCheckboxMethods>;
export type TreeExtraProvide = {
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
};
export const TreeCollector = createCollector<TreeSetupProps, TreeItemSetupProps, TreeExtraProvide, true>({
  ...getCollectorOptions('tree', true, false, true),
  tree: true,
});

export type TreeParentContext = ReturnType<(typeof TreeCollector)['parent']>;
