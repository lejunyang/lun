import {
  CollectorContext,
  createCollector,
  useVirtualList,
  useRefWeakMap,
  useRefWeakSet,
  UseExpandMethods,
  UseSelectMethods,
  UseSelectState,
  useSelectMethods,
} from '@lun-web/core';
import { TableSetupProps, TableColumnSetupProps } from './type';
import { getCollectorOptions } from 'common';
import { InternalColumn } from './internalType';

export type TableState = {
  hoveringIndex: number | null;
};

export type TableProvideExtra = {
  data: () => (readonly [rowData: unknown, rowIndex: number, key: any])[];
  maxLevel: () => number;
  collapsed: ReturnType<typeof useRefWeakSet<InternalColumn>>;
  cellMerge: ReturnType<typeof useRefWeakMap<InternalColumn, [startRowIndex: number, mergedCount: number][]>>;
  all: () => InternalColumn[];
  showResize(target: HTMLElement, column: InternalColumn): void;
  virtual: ReturnType<typeof useVirtualList>;
  rowExpand: UseExpandMethods;
  select: ReturnType<typeof useSelectMethods>;
  state: TableState;
};

export type TableExternalContext = {
  rowExpand: UseExpandMethods;
  rowSelect: UseSelectMethods;
  rowSelectionState: UseSelectState;
};

export const toExternalContext = ({ rowExpand, select }: TableProvideExtra) => ({
  rowExpand,
  rowSelect: select[1],
  rowSelectionState: select[0],
});

export const TableColumnCollector = createCollector<TableSetupProps, TableColumnSetupProps, TableProvideExtra, true>({
  ...getCollectorOptions('table', true),
  tree: true,
});

export type TableColumnCollectorContext = CollectorContext<TableSetupProps, TableColumnSetupProps, TableProvideExtra>;
