import { freeze, MaybeArray, MaybeSet } from '@lun-web/utils';
import {
  GetEventPropsFromEmits,
  themeProps,
  CommonProps,
  Prop,
  PropNumber,
  editStateProps,
  PropArray,
  PropBoolean,
  createTransitionProps,
  PropString,
  PropObject,
  PropSet,
  createEmits,
  GetEventMapFromEmits,
} from 'common';
import { ExtractPropTypes } from 'vue';

export const treeProps = freeze({
  ...themeProps,
  ...editStateProps,
  /**
   * @locale.zh-CN 数据驱动的树节点配置数组，每项可包含 children 与 loadable 字段。
   * @locale.en Data-driven tree node configuration array; each item may include children and loadable fields.
   */
  items: PropArray<(TreeItemSetupProps & { children?: TreeItemSetupProps[]; loadable?: boolean })[]>(),
  /**
   * @locale.zh-CN 用于将 items 中的字段名映射为标准 TreeItem 属性的对照表。
   * @locale.en Mapping that renames fields in items to the standard TreeItem prop names.
   */
  itemPropsMap: PropObject<Record<keyof TreeItemSetupProps | 'children' | 'key', string> & Record<string, string>>(),
  /**
   * @locale.zh-CN 是否监听 TreeItem 自身属性的变化以同步更新树状态。
   * @locale.en Whether to watch TreeItem own props for changes and sync tree state accordingly.
   */
  watchItemProps: PropBoolean(), // TODO value/disabled
  /**
   * @locale.zh-CN 已勾选节点的值集合，用于受控勾选状态。
   * @locale.en Set of checked node values for controlled check state.
   */
  checked: PropSet(),
  /**
   * @locale.zh-CN 已选中节点的值，单选时为单个值，多选时为数组或 Set。
   * @locale.en Selected node value(s); a single value in single mode, an array or Set in multiple mode.
   */
  selected: Prop<MaybeArray<any> | MaybeSet<any>>(),
  /**
   * @locale.zh-CN 已展开节点的值集合，用于受控展开状态。
   * @locale.en Set of expanded node values for controlled expand state.
   */
  expanded: PropSet(),
  /**
   * @locale.zh-CN 是否默认展开所有节点。
   * @locale.en Whether to expand all nodes by default.
   */
  defaultExpandAll: PropBoolean(),
  /**
   * @locale.zh-CN 节点的可选择区域，line 为整行可选，label 为仅文字可选。
   * @locale.en Node selectable area: line makes the whole row selectable, label restricts selection to the text.
   */
  selectable: PropString<'line' | 'label' | (string & {})>(),
  /**
   * @locale.zh-CN 选择模式：multiple 多选，ctrl-multiple 按 Ctrl 多选，其他值为单选。
   * @locale.en Selection mode: multiple for multi-select, ctrl-multiple for Ctrl-based multi-select, other values for single select.
   */
  selectionMode: PropString<'single' | 'multiple' | 'ctrl-multiple' | (string & {})>(),
  /**
   * @locale.zh-CN 是否在每个节点前渲染勾选框以启用勾选功能。
   * @locale.en Whether to render a checkbox on each node to enable checking.
   */
  checkable: PropBoolean(),
  /**
   * @locale.zh-CN 勾选策略：tree 时父子节点的勾选状态会互相联动，separate 时各节点独立。
   * @locale.en Check strategy: tree links parent and child check states, separate treats every node independently.
   */
  // TODO
  checkStrategy: PropString<'tree' | 'separate' | (string & {})>(),
  /**
   * @locale.zh-CN 每一层级的缩进像素值，用于控制子节点的左侧缩进。
   * @locale.en Indent size in pixels per tree level, controlling how far child nodes are indented.
   * @default 20
   */
  indentSize: PropNumber(),
});

export const treeEmits = createEmits<{
  update: {
    checked: {
      value: unknown[];
      raw: Set<unknown>;
    };
    selected: {
      value: unknown;
      raw: unknown;
    };
    expanded: {
      value: unknown;
      raw: unknown;
    };
  };
  check: {
    value: unknown[];
    raw: Set<unknown>;
  };
  select: {
    value: unknown;
    raw: unknown;
  };
  expand: {
    value: unknown;
    raw: unknown;
  };
}>(['update', 'check', 'select', 'expand']);

export type TreeSetupProps = ExtractPropTypes<typeof treeProps> & CommonProps;
export type TreeEventProps = GetEventPropsFromEmits<typeof treeEmits>;
export type TreeEventMap = GetEventMapFromEmits<typeof treeEmits>;
export type TreeProps = Partial<TreeSetupProps> & TreeEventProps;

export const treeItemProps = freeze({
  ...themeProps,
  ...editStateProps,
  ...createTransitionProps('expand'),
  /**
   * @locale.zh-CN 节点显示的文本内容，也可通过 label 插槽自定义渲染。
   * @locale.en Text content shown for the node; can also be customized via the label slot.
   */
  label: Prop(),
  /**
   * @locale.zh-CN 节点的唯一值，用于受控选中、勾选与展开状态的标识。
   * @locale.en Unique value of the node, used as the identifier for controlled select, check and expand states.
   */
  value: Prop(),
  /** @internal it's for internal use, representing the column object, do not use it yourself! */
  _: PropObject<any>(),
});

export const treeItemEmits = freeze({});

export type TreeItemSetupProps = Omit<ExtractPropTypes<typeof treeItemProps>, '_'> & CommonProps;
export type TreeItemEventProps = GetEventPropsFromEmits<typeof treeItemEmits>;
export type TreeItemEventMap = GetEventMapFromEmits<typeof treeItemEmits>;
export type TreeItemProps = Partial<TreeItemSetupProps> & TreeItemEventProps;
