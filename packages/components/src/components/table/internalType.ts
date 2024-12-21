import { ComponentInternalInstance } from 'vue';
import { TableActions, TableColumnSetupProps } from './type';

export type InternalRowInfo = readonly [rowData: unknown, rowIndex: number, key: any];

export type InternalTableActionParams = {
  /** props is table column's props. as it's used in column type definition and refers itself, use any here. Correct it in TableColumnProps */
  props: any;
  row: unknown;
  index: number;
  key: string | number;
  get actions(): TableActions;
};

export type InternalColumn = TableColumnSetupProps | ComponentInternalInstance;
