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
  PropBoolean,
  PropObject,
} from 'common';
import { CSSProperties, ExtractPropTypes } from 'vue';

export type TableCellProps = Partial<{
  colSpan: number;
  rowSpan: number;
  style: CSSProperties;
}>;

export const tableColumnProps = freeze({
  type: PropString(),
  name: PropString(),
  plainName: undefBoolProp,
  label: Prop(),
  /** determine the colSpan for header, will span and cover next columns. only apply to root columns with no children. if nested columns exist in the span, the span will stop right before it */
  headerColSpan: PropNumber(),
  cellProps: PropObjOrFunc<
    TableCellProps | ((item: unknown, rowIndex: number, columnProps: any) => TableCellProps | undefined)
  >(),
  sticky: PropBoolOrStr<boolean | 'left' | 'right'>(),
  width: PropNumber(),
  resizable: PropBoolean(), // TODO
  align: PropString<CSSProperties['text-align'] & {}>(),
  overflow: PropBoolean(), // TODO
  /** @private it's for internal use, representing the column object, do not use it yourself! */
  _: PropObject<any>(),
});

export const tableColumnEmits = createEmits<{}>([]);

export type TableColumnSetupProps = Omit<ExtractPropTypes<typeof tableColumnProps>, '_'> & CommonProps;
export type TableColumnEvents = GetEventPropsFromEmits<typeof tableColumnEmits>;
export type TableColumnProps = Partial<TableColumnSetupProps> & TableColumnEvents;

// -------------------------- Table Props --------------------------

type TableColumnWithChildren = TableColumnProps &
  Partial<{
    children: TableColumnWithChildren[];
  }>;

export const tableProps = freeze({
  ...themeProps,
  data: PropArray(),
  columns: PropArray<TableColumnWithChildren[]>(),
  stickyHeader: PropBoolean(),
  // TODO stickyRow
});

export const tableEmits = createEmits<{}>([]);

export type TableSetupProps = ExtractPropTypes<typeof tableProps> & CommonProps;
export type TableEvents = GetEventPropsFromEmits<typeof tableEmits>;
export type TableProps = Partial<TableSetupProps> & TableEvents;
