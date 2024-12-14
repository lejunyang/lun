import { createCollector, useCollectorExternalChildren, useWeakMap, useWeakSet } from '@lun-web/core';
import { TableSetupProps, TableColumnSetupProps } from './type';
import { getCollectorOptions } from 'common';
import { ComponentInternalInstance, ComputedRef } from 'vue';

export type TableProvideExtra = {
  data: ComputedRef<unknown[]>;
  maxLevel: () => number;
  collapsed: ReturnType<typeof useWeakSet<ComponentInternalInstance | TableColumnSetupProps>>;
  cellMerge: ReturnType<
    typeof useWeakMap<ComponentInternalInstance | TableColumnSetupProps, [startRowIndex: number, mergedCount: number][]>
  >;
  columns: ReturnType<typeof useCollectorExternalChildren>[0];
  columnVmMap: ReturnType<typeof useWeakMap<TableColumnSetupProps, ComponentInternalInstance>>;
  all: () => (ComponentInternalInstance | TableColumnSetupProps)[];
};

export const TableColumnCollector = createCollector<TableSetupProps, TableColumnSetupProps, TableProvideExtra, true>({
  ...getCollectorOptions('table', true, true),
  tree: true,
});
