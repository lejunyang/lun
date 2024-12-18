import { createCollector, useCollectorExternalChildren, useVirtualList, useWeakMap, useWeakSet } from '@lun-web/core';
import { TableSetupProps, TableColumnSetupProps, InternalColumn } from './type';
import { getCollectorOptions } from 'common';
import { ComponentInternalInstance } from 'vue';

export type TableProvideExtra = {
  data: () => unknown[];
  maxLevel: () => number;
  collapsed: ReturnType<typeof useWeakSet<InternalColumn>>;
  cellMerge: ReturnType<typeof useWeakMap<InternalColumn, [startRowIndex: number, mergedCount: number][]>>;
  columns: ReturnType<typeof useCollectorExternalChildren>[0];
  columnVmMap: ReturnType<typeof useWeakMap<TableColumnSetupProps, ComponentInternalInstance>>;
  all: () => InternalColumn[];
  showResize(target: HTMLElement, column: InternalColumn): void;
  virtual: ReturnType<typeof useVirtualList>;
};

export const TableColumnCollector = createCollector<TableSetupProps, TableColumnSetupProps, TableProvideExtra, true>({
  ...getCollectorOptions('table', true, true),
  tree: true,
});
