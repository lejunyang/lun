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
  /**
   * @locale.zh-CN 列的内置类型，可选 index（序号列）或自定义类型 key，用于匹配内置渲染器。
   * @locale.en Built-in column type such as index, or a custom type key matched against the registered renderers.
   */
  type: PropString<'index' | (string & {})>(),
  /**
   * @locale.zh-CN 该列在每行数据中对应的字段名，支持嵌套路径，例如 user.name 或 ['user','name']。
   * @locale.en Field name in row data this column reads from. Supports nested paths such as user.name or ['user','name'].
   */
  name: PropString(),
  /**
   * @locale.zh-CN 是否将 name 视为纯字符串字段名，不再解析为嵌套路径。
   * @locale.en When true, treat name as a plain string key without splitting it into a nested path.
   */
  plainName: undefBoolProp,
  /**
   * @locale.zh-CN 自定义表头内容，可为渲染源或返回渲染源的函数。
   * @locale.en Custom header content, either a render source or a function that returns one.
   */
  header: Prop<GetCustomRendererSource | ((params: TableColumnHeaderParams) => GetCustomRendererSource)>(),
  /**
   * @locale.zh-CN 自定义单元格渲染函数，参数中可拿到当前行数据、索引、列属性等。
   * @locale.en Custom cell renderer; receives the current row data, index and column props.
   */
  renderer: PropFunction<(params: InternalTableColumnRendererParams) => GetCustomRendererSource>(),
  /**
   * @locale.zh-CN 表头列合并数量，会向后跨越并覆盖相邻列；仅对没有子列的顶层列生效，遇到嵌套列时会在其之前停止。
   * @locale.en Header colspan that extends into subsequent columns. Only applies to root columns without children and stops right before a nested column.
   */
  headerColSpan: PropNumber(),
  /**
   * @locale.zh-CN 透传到表头容器元素上的属性。
   * @locale.en Extra props forwarded to the header container element.
   */
  headerProps: PropObject(),
  /**
   * @locale.zh-CN 单元格属性，可为对象或根据行数据返回属性的函数，支持 rowSpan、colSpan、innerProps 等。
   * @locale.en Cell props, either an object or a function returning props per row. Supports rowSpan, colSpan and innerProps.
   */
  cellProps: PropObjOrFunc<
    TableCellProps | ((item: unknown, rowIndex: number, columnProps: any) => TableCellProps | undefined)
  >(),
  /**
   * @locale.zh-CN 将该列固定为粘性列，可设为 true、'left' 或 'right'；嵌套列只需在顶层设置。
   * @locale.en Makes the column sticky. Accepts true, 'left' or 'right'; for nested columns only set on the root.
   */
  sticky: PropBoolOrStr<boolean | 'left' | 'right' | (string & {})>(),
  /**
   * @locale.zh-CN 列宽，支持任意 Grid 列有效值，数字会被视为像素值，仅在最底层叶子列上生效。
   * @locale.en Column width. Accepts any valid grid track value; numbers are treated as pixels. Only effective on leaf columns.
   */
  width: PropNumber(),
  /**
   * @locale.zh-CN 是否允许用户通过拖动表头右边界调整该列宽度，仅在最底层叶子列上生效。
   * @locale.en Whether the user can resize the column by dragging the right edge of the header. Only effective on leaf columns.
   */
  resizable: PropBoolean(),
  /**
   * @locale.zh-CN 单元格内容水平对齐方式，会被设置为单元格的 justify-content，默认 start。
   * @locale.en Horizontal alignment of cell content, applied as the cell's justify-content. Defaults to start.
   */
  justify: PropString<Property.JustifyContent>(),
  /**
   * @locale.zh-CN 单元格内容垂直对齐方式，会被设置为单元格的 align-items，默认 center。
   * @locale.en Vertical alignment of cell content, applied as the cell's align-items. Defaults to center.
   */
  align: PropString<Property.AlignItems>(),
  /**
   * @locale.zh-CN 内容超出时是否以省略号显示。
   * @locale.en Whether to truncate overflowing cell content with an ellipsis.
   */
  ellipsis: PropBoolean(),
  /**
   * @locale.zh-CN 单元格内容溢出时的处理方式。
   * @locale.en How overflowing cell content should be handled.
   */
  overflow: PropString(),
  /**
   * @locale.zh-CN 表头额外的帮助提示文本。
   * @locale.en Additional help text shown next to the column header.
   */
  help: PropString(),
  /**
   * @locale.zh-CN 单元格事件触发的动作，可为内置动作 key、回调函数，或按事件分发的对象（onCellClick、onCellDblclick、onCellContextmenu）。
   * @locale.en Actions triggered by cell events. Accepts a built-in action key, a callback, or an object keyed by onCellClick, onCellDblclick or onCellContextmenu.
   */
  actions: Prop<
    | TableActionKeys
    | ((params: InternalTableActionParams) => void)
    | Record<
        'onCellClick' | 'onCellDblclick' | 'onCellContextmenu',
        ((params: InternalTableActionParams) => void) | TableActionKeys
      >
  >(),
  /**
   * @locale.zh-CN 是否隐藏该列，对应原生 hidden 属性的取值。
   * @locale.en Whether to hide the column. Accepts the same values as the native hidden attribute.
   */
  hidden: PropBoolOrStr<HTMLAttributes['hidden'] & {}>(),
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
  /**
   * @locale.zh-CN 表格的行数据数组。
   * @locale.en Array of row data rendered by the table.
   */
  data: PropArray(),
  /**
   * @locale.zh-CN 行数据的字段映射，用于自定义 key 与 children 字段在数据对象上的实际名称。
   * @locale.en Field name mapping for row data, customising how the key and children fields are read from each item.
   */
  dataPropsMap: PropObject<Record<'key' | 'children', string>>(),
  /**
   * @locale.zh-CN 列定义数组，可与 l-table-column 子节点结合使用；通过 children 字段实现嵌套列。
   * @locale.en Column definition array. Can be combined with l-table-column children. Use the children field for nested columns.
   */
  columns: PropArray<TableColumnWithChildren[]>(),
  /**
   * @locale.zh-CN 列对象的字段映射，用于自定义 key 与 children 字段在列对象上的实际名称。
   * @locale.en Field name mapping for column definitions, customising how the key and children fields are read.
   */
  columnPropsMap: PropObject<Record<'key' | 'children', string>>(),
  /**
   * @locale.zh-CN 是否渲染内置的序号列，可设为对象以扩展该列的其他属性。
   * @locale.en Whether to render the built-in index column. Can be an object to extend the column with extra props.
   */
  indexColumn: PropObjOrBool<boolean | Omit<TableColumnProps, 'type'>>(),
  /**
   * @locale.zh-CN 是否渲染内置的选择列，根据 selectionMode 自动渲染单选或多选；可设为对象以扩展该列的其他属性。
   * @locale.en Whether to render the built-in selection column. Renders radio or checkbox based on selectionMode. Can be an object to extend the column.
   */
  selectColumn: PropObjOrBool<boolean | Omit<TableColumnProps, 'type'>>(),
  /**
   * @locale.zh-CN 表头高度，支持任意 Grid 行有效值，数字会被视为像素值，默认 auto。
   * @locale.en Header height. Accepts any valid grid track value; numbers are treated as pixels. Defaults to auto.
   */
  headerHeight: PropNumber<Property.GridTemplateRows | number>(),
  /**
   * @locale.zh-CN 行高，可为统一的 Grid 行有效值或返回单行高度的函数，数字会被视为像素值。
   * @locale.en Row height. Accepts a grid track value or a function returning the height per row; numbers are treated as pixels.
   */
  rowHeight: PropNumOrFunc<
    Property.GridTemplateRows | number | ((rowData: unknown, rowIndex: number) => Property.GridTemplateRows | number)
  >(),
  /**
   * @locale.zh-CN 表格根元素的内联样式对象。
   * @locale.en Inline style object applied to the table root element.
   */
  rootStyle: PropObject<Record<keyof CSSProperties, string | null | undefined>>(),
  /**
   * @locale.zh-CN 是否启用表头粘性定位，滚动时表头会保持在顶部。
   * @locale.en Whether to enable sticky header so it stays at the top while scrolling.
   */
  stickyHeader: PropBoolean(),
  /**
   * @locale.zh-CN 是否开启虚拟渲染，仅渲染可见区域附近的行；表格需自行设置高度作为滚动容器。
   * @locale.en Enable virtual rendering so only rows near the viewport are rendered. The table must have a height to act as the scroll container.
   */
  virtual: PropBoolean(),
  /**
   * @locale.zh-CN 隐藏表头，目前与粘性列功能冲突。
   * @locale.en Hide the table header. Currently conflicts with sticky columns.
   */
  noHeader: PropBoolean(),
  /**
   * @locale.zh-CN 已展开的行集合，值为行数据的 key（缺省则为索引），可传 Set 或数组。
   * @locale.en Set of expanded rows, keyed by the row data key (falls back to index). Accepts a Set or an array.
   */
  rowExpanded: PropSet(),
  /**
   * @locale.zh-CN 行展开内容的自定义渲染函数，返回非空值时该行才可展开。
   * @locale.en Renderer for the row expansion content; a row becomes expandable only when it returns a non-empty value.
   */
  rowExpandedRenderer: PropFunction<(record: unknown, rowIndex: number) => GetCustomRendererSource>(),
  /**
   * @locale.zh-CN 是否开启行悬停高亮效果。
   * @locale.en Whether to highlight rows on hover.
   */
  rowHoverable: PropBoolean(),
  /**
   * @locale.zh-CN 当前选中的行 key，支持单值、数组或 Set，根据 selectionMode 区分单选/多选。
   * @locale.en Currently selected row keys. Accepts a single value, an array or a Set; single or multi-select depends on selectionMode.
   */
  selected: Prop<MaybeArray<string | number> | MaybeSet<string | number>>(),
  /**
   * @locale.zh-CN 行选择模式，可选 single 或 multiple，默认按单选处理。
   * @locale.en Row selection mode, either single or multiple. Defaults to single behaviour.
   */
  selectionMode: PropString<'single' | 'multiple'>(),
  /**
   * @locale.zh-CN 行级动作，可为内置动作 key、回调函数，或按事件分发的对象（onRowClick、onRowDblclick、onRowContextmenu）。
   * @locale.en Row-level actions. Accepts a built-in action key, a callback, or an object keyed by onRowClick, onRowDblclick or onRowContextmenu.
   */
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
