import { createCollector, useWeakMap, useWeakSet } from '@lun-web/core';
import { TableSetupProps, TableColumnSetupProps } from './type';
import { getCollectorOptions } from 'common';
import { ComponentInternalInstance, ComputedRef } from 'vue';

export type TableProvideExtra = {
  data: ComputedRef<unknown[]>;
  maxLevel: () => number;
  collapsed: ReturnType<typeof useWeakSet<ComponentInternalInstance>>;
  cellMerge: ReturnType<typeof useWeakMap<ComponentInternalInstance, [startRowIndex: number, mergedCount: number][]>>
};

export const TableColumnCollector = createCollector<TableSetupProps, TableColumnSetupProps, TableProvideExtra, true>({
  ...getCollectorOptions('table', true),
  tree: true,
});
