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
  PropNumOrFunc,
  PropFunction,
  PropSet,
  PropObjOrStr,
} from 'common';
import { CSSProperties, ExtractPropTypes, HTMLAttributes } from 'vue';
import type { Property } from 'csstype';
import { GetCustomRendererSource } from '../custom-renderer';
import { InternalTableActionParams } from './internalType';

export type TableCellProps = Partial<{
  colSpan: number;
  rowSpan: number;
  innerProps: HTMLAttributes;
}> &
  HTMLAttributes;

export type TableActionKeys = 'toggleRowExpand' | (string & {});
export type TableActions = Record<TableActionKeys, () => void>;

export const tableColumnProps = freeze({
  type: PropString<'index' | (string & {})>(),
  name: PropString(),
  plainName: undefBoolProp,
  header: Prop<GetCustomRendererSource>(),
  renderer:
    PropFunction<(value: unknown, rowIndex: number, rowData: unknown, columnProps: any) => GetCustomRendererSource>(),
  /** determine the colSpan for header, will span and cover next columns. only apply to root columns with no children. if nested columns exist in the span, the span will stop right before it */
  headerColSpan: PropNumber(), // TODO sticky support when having headerColSpan
  headerProps: PropObject(),
  cellProps: PropObjOrFunc<
    TableCellProps | ((item: unknown, rowIndex: number, columnProps: any) => TableCellProps | undefined)
  >(),
  // autoGroup: PropBoolean(),
  sticky: PropBoolOrStr<boolean | 'left' | 'right' | (string & {})>(),
  width: PropNumber(),
  resizable: PropBoolean(),
  justify: PropString<Property.JustifyContent>(),
  align: PropString<Property.AlignItems>(),
  ellipsis: PropBoolean(), // TODO
  overflow: PropString(), // TODO
  help: PropString(), // TODO
  actions: PropObjOrStr<
    | TableActionKeys
    | ((params: InternalTableActionParams) => void)
    | Record<
        'onCellClick' | 'onCellDblclick' | 'onCellContextmenu',
        ((params: InternalTableActionParams) => void) | TableActionKeys
      >
  >(),
  hidden: PropBoolOrStr(),
  /** @internal it's for internal use, representing the column object, do not use it yourself! */
  _: PropObject<any>(),
});

export const tableColumnEmits = createEmits<{}>([]);

export type TableColumnSetupProps = Omit<ExtractPropTypes<typeof tableColumnProps>, '_'> & CommonProps;
export type TableActionParams = {
  row: unknown;
  index: number;
  key: string | number;
  props: TableColumnSetupProps;
  get actions(): TableActions;
};
export type TableColumnEvents = GetEventPropsFromEmits<typeof tableColumnEmits>;
export type TableColumnProps = Omit<Partial<TableColumnSetupProps>, 'actions'> & {
  actions?:
    | TableActionKeys
    | ((params: TableActionParams) => void)
    | Record<
        'onCellClick' | 'onCellDblclick' | 'onCellContextmenu',
        ((params: TableActionParams) => void) | TableActionKeys
      >;
} & TableColumnEvents;
// -------------------------- Table Column Props --------------------------

// -------------------------- Table Props --------------------------
type TableColumnWithChildren = TableColumnProps &
  Partial<{
    children: TableColumnWithChildren[];
    key: string | number;
  }>;

export const tableProps = freeze({
  ...themeProps,
  data: PropArray(),
  dataPropsMap: PropObject<Record<'key' | 'children', string>>(),
  columns: PropArray<TableColumnWithChildren[]>(),
  columnPropsMap: PropObject<Record<'key' | 'children', string>>(),
  headerHeight: PropNumber<Property.GridTemplateRows>(),
  rowHeight: PropNumOrFunc<
    Property.GridTemplateRows | ((rowData: unknown, rowIndex: number) => Property.GridTemplateRows)
  >(),
  rootStyle: PropObject<CSSProperties>(),
  stickyHeader: PropBoolean(),
  virtual: PropBoolean(),
  /** hide the header, currently it's conflict with sticky columns functionality */
  noHeader: PropBoolean(),
  // TODO stickyRow
  rowExpanded: PropSet(),
  rowExpandedRenderer: PropFunction<(record: unknown, rowIndex: number) => GetCustomRendererSource>(),
  actions: PropObjOrStr<
    | TableActionKeys
    | ((params: TableActionParams) => void)
    | Record<
        'onRowClick' | 'onRowDblclick' | 'onRowContextmenu',
        ((params: TableActionParams) => void) | TableActionKeys
      >
  >(),
});

export const tableEmits = createEmits<{
  rowExpand: {
    raw: Set<string | number>;
    value: (string | number)[];
  };
}>(['rowExpand']);

export type TableSetupProps = ExtractPropTypes<typeof tableProps> & CommonProps;
export type TableEvents = GetEventPropsFromEmits<typeof tableEmits>;
export type TableProps = Partial<TableSetupProps> & TableEvents;
// -------------------------- Table Props --------------------------
