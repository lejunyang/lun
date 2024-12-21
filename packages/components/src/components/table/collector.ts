import {
  CollectorContext,
  createCollector,
  useCollectorExternalChildren,
  useExpandMethods,
  useVirtualList,
  useWeakMap,
  useWeakSet,
} from '@lun-web/core';
import { TableSetupProps, TableColumnSetupProps } from './type';
import { getCollectorOptions } from 'common';
import { ComponentInternalInstance } from 'vue';
import { InternalColumn } from './internalType';

export type TableProvideExtra = {
  data: () => (readonly [rowData: unknown, rowIndex: number, key: any])[];
  maxLevel: () => number;
  collapsed: ReturnType<typeof useWeakSet<InternalColumn>>;
  cellMerge: ReturnType<typeof useWeakMap<InternalColumn, [startRowIndex: number, mergedCount: number][]>>;
  columns: ReturnType<typeof useCollectorExternalChildren>[0];
  columnVmMap: ReturnType<typeof useWeakMap<TableColumnSetupProps, ComponentInternalInstance>>;
  all: () => InternalColumn[];
  showResize(target: HTMLElement, column: InternalColumn): void;
  virtual: ReturnType<typeof useVirtualList>;
  rowExpand: ReturnType<typeof useExpandMethods>;
};

export const TableColumnCollector = createCollector<TableSetupProps, TableColumnSetupProps, TableProvideExtra, true>({
  ...getCollectorOptions('table', true, true),
  tree: true,
});


export type TableColumnCollectorContext = CollectorContext<TableSetupProps, TableColumnSetupProps, TableProvideExtra>;