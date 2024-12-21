import { ComponentInternalInstance } from "vue";
import { TableColumnSetupProps } from "./type";

export type InternalRowInfo = readonly [rowData: unknown, rowIndex: number, key: any];

export type InternalTableActionParams = {
  props: any;
  row: unknown;
  index: number;
  key: string | number;
};

export type InternalColumn = TableColumnSetupProps | ComponentInternalInstance;
