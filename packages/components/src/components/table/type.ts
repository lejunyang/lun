import { freeze, MaybeArray, MaybeSet } from '@lun-web/utils';
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
  PropObjOrBool,
  GetEventMapFromEmits,
} from 'common';
import { CSSProperties, ExtractPropTypes, HTMLAttributes } from 'vue';
import type { Property } from 'csstype';
import { GetCustomRendererSource } from '../custom-renderer';
import { InternalTableActionParams, InternalTableColumnRendererParams, TableColumnHeaderParams } from './internalType';
import { TableExternalContext } from './collector';

export type TableCellProps = Partial<{
  colSpan: number;
  rowSpan: number;
  innerProps: HTMLAttributes;
}> &
  HTMLAttributes;

export type TableActionKeys =
  | 'rowExpand.toggle'
  | 'rowExpand.expand'
  | 'rowExpand.collapse'
  | 'rowExpand.expandAll'
  | 'rowExpand.collapseAll'
  | 'rowSelect.toggle'
  | 'rowSelect.select'
  | 'rowSelect.unselect'
  | 'rowSelect.selectAll'
  | 'rowSelect.unselectAll'
  | (string & {});

export const tableColumnProps = freeze({
  type: PropString<'index' | (string & {})>(),
  name: PropString(),
  plainName: undefBoolProp,
  header: Prop<GetCustomRendererSource | ((params: TableColumnHeaderParams) => GetCustomRendererSource)>(),
  renderer: PropFunction<(params: InternalTableColumnRendererParams) => GetCustomRendererSource>(),
  /** determine the colSpan for header, will span and cover next columns. only apply to root columns with no children. if nested columns exist in the span, the span will stop right before it */
  headerColSpan: PropNumber(), // TODO sticky support when having headerColSpan
  headerProps: PropObject(),
  cellProps: PropObjOrFunc<
    TableCellProps | ((item: unknown, rowIndex: number, columnProps: any) => TableCellProps | undefined)
  >(),
  // autoGroup: PropBoolean(),
  sticky: PropBoolOrStr<boolean | 'left' | 'right' | (string & {})>(), // TODO 'group-left' | 'group-right'
  width: PropNumber(),
  resizable: PropBoolean(),
  justify: PropString<Property.JustifyContent>(),
  align: PropString<Property.AlignItems>(),
  ellipsis: PropBoolean(), // TODO
  overflow: PropString(), // TODO
  help: PropString(), // TODO
  actions: Prop<
    | TableActionKeys
    | ((params: InternalTableActionParams) => void)
    | Record<
        'onCellClick' | 'onCellDblclick' | 'onCellContextmenu',
        ((params: InternalTableActionParams) => void) | TableActionKeys
      >
  >(),
  hidden: PropBoolOrStr<HTMLAttributes['hidden'] & {}>(),
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
  context: TableExternalContext;
};
export type TableColumnRendererParams = {
  value: unknown;
  index: number;
  row: unknown;
  key: string | number;
  props: TableColumnSetupProps;
  context: TableExternalContext;
};
export type TableColumnEventProps = GetEventPropsFromEmits<typeof tableColumnEmits>;
export type TableColumnEventMap = GetEventMapFromEmits<typeof tableColumnEmits>;
export type TableColumnProps = Omit<Partial<TableColumnSetupProps>, 'actions'> & {
  actions?:
    | TableActionKeys
    | ((params: TableActionParams) => void)
    | Record<
        'onCellClick' | 'onCellDblclick' | 'onCellContextmenu',
        ((params: TableActionParams) => void) | TableActionKeys
      >;
} & TableColumnEventProps;
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
  indexColumn: PropObjOrBool<boolean | Omit<TableColumnProps, 'type'>>(),
  selectColumn: PropObjOrBool<boolean | Omit<TableColumnProps, 'type'>>(),
  headerHeight: PropNumber<Property.GridTemplateRows | number>(),
  rowHeight: PropNumOrFunc<
    Property.GridTemplateRows | number | ((rowData: unknown, rowIndex: number) => Property.GridTemplateRows | number)
  >(),
  rootStyle: PropObject<CSSProperties>(),
  stickyHeader: PropBoolean(),
  virtual: PropBoolean(),
  /** hide the header, currently it's conflict with sticky columns functionality */
  noHeader: PropBoolean(),
  // TODO stickyRow
  rowExpanded: PropSet(),
  rowExpandedRenderer: PropFunction<(record: unknown, rowIndex: number) => GetCustomRendererSource>(),
  rowHoverable: PropBoolean(),
  selected: Prop<MaybeArray<string | number> | MaybeSet<string | number>>(),
  selectionMode: PropString<'single' | 'multiple'>(),
  actions: Prop<
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
  select: {
    raw: MaybeSet<string | number>;
    value: MaybeArray<string | number>;
  };
}>(['rowExpand', 'select']);

export type TableSetupProps = ExtractPropTypes<typeof tableProps> & CommonProps;
export type TableEventProps = GetEventPropsFromEmits<typeof tableEmits>;
export type TableEventMap = GetEventMapFromEmits<typeof tableEmits>;
export type TableProps = Partial<TableSetupProps> & TableEventProps;
// -------------------------- Table Props --------------------------
