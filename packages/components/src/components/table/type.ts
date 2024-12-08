import { freeze } from '@lun-web/utils';
import {
  GetEventPropsFromEmits,
  PropString,
  themeProps,
  CommonProps,
  createEmits,
  PropArray,
  Prop,
  undefBoolProp,
  PropNumber,
  PropBoolOrStr,
  PropObjOrFunc,
} from 'common';
import { CSSProperties, ExtractPropTypes } from 'vue';

export const tableProps = freeze({
  ...themeProps,
  data: PropArray(),
});

export const tableEmits = createEmits<{}>([]);

export type TableSetupProps = ExtractPropTypes<typeof tableProps> & CommonProps;
export type TableEvents = GetEventPropsFromEmits<typeof tableEmits>;
export type TableProps = Partial<TableSetupProps> & TableEvents;

export type TableCellProps = Partial<{
  colSpan: number;
  rowSpan: number;
  style: CSSProperties
}>

export const tableColumnProps = freeze({
  type: PropString(),
  name: PropString(),
  plainName: undefBoolProp,
  label: Prop(),
  headColSpan: PropNumber(),
  cellProps: PropObjOrFunc<TableCellProps | ((item: unknown, rowIndex: number, columnProps: any) => TableCellProps | undefined)>(),
  sticky: PropBoolOrStr<boolean | 'left' | 'right'>(),
});

export const tableColumnEmits = createEmits<{}>([]);

export type TableColumnSetupProps = ExtractPropTypes<typeof tableColumnProps> & CommonProps;
export type TableColumnEvents = GetEventPropsFromEmits<typeof tableColumnEmits>;
export type TableColumnProps = Partial<TableColumnSetupProps> & TableColumnEvents;
