import {
  CollectorContext,
  createCollector,
  useCollectorExternalChildren,
  useVirtualList,
  useRefWeakMap,
  useRefWeakSet,
  UseExpandMethods,
} from '@lun-web/core';
import { TableSetupProps, TableColumnSetupProps } from './type';
import { getCollectorOptions } from 'common';
import { ComponentInternalInstance } from 'vue';
import { InternalColumn } from './internalType';

export type TableState = {
  hoveringIndex: number | null;
};

export type TableProvideExtra = {
  data: () => (readonly [rowData: unknown, rowIndex: number, key: any])[];
  maxLevel: () => number;
  collapsed: ReturnType<typeof useRefWeakSet<InternalColumn>>;
  cellMerge: ReturnType<typeof useRefWeakMap<InternalColumn, [startRowIndex: number, mergedCount: number][]>>;
  columns: ReturnType<typeof useCollectorExternalChildren>[0];
  columnVmMap: ReturnType<typeof useRefWeakMap<TableColumnSetupProps, ComponentInternalInstance>>;
  all: () => InternalColumn[];
  showResize(target: HTMLElement, column: InternalColumn): void;
  virtual: ReturnType<typeof useVirtualList>;
  rowExpand: UseExpandMethods;
  state: TableState;
};

export const TableColumnCollector = createCollector<TableSetupProps, TableColumnSetupProps, TableProvideExtra, true>({
  ...getCollectorOptions('table', true, true),
  tree: true,
});


export type TableColumnCollectorContext = CollectorContext<TableSetupProps, TableColumnSetupProps, TableProvideExtra>;