import {
  editStateProps,
  themeProps,
  LogicalPosition,
  GetEventPropsFromEmits,
  PropBoolean,
  PropString,
  valueProp,
  CommonProps,
  PropSet,
  createEmits,
  GetEventMapFromEmits,
} from 'common';
import { ExtractPropTypes } from 'vue';
import { createOptionProps } from '../../hooks/useOptions';
import { freeze } from '@lun-web/utils';

export const checkboxProps = freeze({
  ...editStateProps,
  ...themeProps,
  /**
   * @locale.zh-CN 复选框的值。当处于 checkbox-group 中时，该值会作为是否选中的标识参与组的选中集合。
   * @locale.en The value of the checkbox. When inside a checkbox-group, it is used as the identifier in the group's selected value set.
   */
  value: valueProp,
  /**
   * @locale.zh-CN 单独使用（不在 checkbox-group 中）时，选中状态对应的值。不推荐使用，若需要请考虑使用 Switch 组件。
   * @locale.en The value representing the checked state when used standalone (not inside a checkbox-group). Not recommended; consider using the Switch component instead.
   */
  trueValue: valueProp,
  /**
   * @locale.zh-CN 单独使用（不在 checkbox-group 中）时，未选中状态对应的值。不推荐使用，若需要请考虑使用 Switch 组件。
   * @locale.en The value representing the unchecked state when used standalone (not inside a checkbox-group). Not recommended; consider using the Switch component instead.
   */
  falseValue: valueProp,
  /**
   * @locale.zh-CN 复选框旁显示的文本标签，也可以通过默认插槽传入。
   * @locale.en The text label shown next to the checkbox; can also be provided via the default slot.
   */
  label: PropString(),
  /**
   * @locale.zh-CN 标签相对于复选框的位置，可选 'start' 或 'end'。
   * @locale.en Position of the label relative to the checkbox indicator, either 'start' or 'end'.
   * @default 'end'
   */
  labelPosition: PropString<LogicalPosition>(),
  /**
   * @locale.zh-CN 是否选中，受控属性。
   * @locale.en Whether the checkbox is checked, as a controlled prop.
   */
  checked: PropBoolean(),
  /**
   * @locale.zh-CN 是否处于半选（中间）状态，常用于全选复选框。
   * @locale.en Whether the checkbox is in the indeterminate (intermediate) state, typically used for a check-all checkbox.
   */
  intermediate: PropBoolean(),
  /**
   * @locale.zh-CN 标记该复选框为所在 checkbox-group 的全选控制项，其选中状态会联动整组的全选与半选。
   * @locale.en Marks this checkbox as the check-all control for its enclosing checkbox-group, syncing with the group's all-checked and indeterminate states.
   */
  checkForAll: PropBoolean(),
  /**
   * @locale.zh-CN 仅作用于具有相同 onlyFor 标识的 checkbox-group；用于在同一页面区分多个分组的关联关系。
   * @locale.en Only takes effect within a checkbox-group whose onlyFor matches; used to distinguish multiple groups on the same page.
   */
  onlyFor: PropString(),
  /**
   * @locale.zh-CN 即便位于 checkbox-group 内部，也将该复选框排除在组的管理之外，独立维护选中状态。
   * @locale.en Excludes this checkbox from the enclosing checkbox-group's management, so it maintains its checked state independently.
   */
  excludeFromGroup: PropBoolean(),
  /**
   * @locale.zh-CN 复选框的显示样式，可选 'checkbox' 普通样式或 'card' 卡片样式。
   * @locale.en Visual style of the checkbox, either 'checkbox' (default) or 'card'.
   */
  type: PropString<'checkbox' | 'card'>(),
});

export type CheckboxUpdateDetail = {
  value: any;
  isCheckForAll: boolean;
  checked: boolean;
  onlyFor?: string;
  excludeFromGroup?: boolean;
};

export const checkboxEmits = createEmits<{
  update: CheckboxUpdateDetail;
}>(['update']);

export const checkboxGroupProps = freeze({
  ...createOptionProps(false),
  ...themeProps,
  /**
   * @locale.zh-CN 当前选中值的集合，使用 Set 存储所有选中项的 value。
   * @locale.en The set of currently selected values, stored as a Set of child checkbox values.
   */
  value: PropSet(),
  /**
   * @locale.zh-CN 当前 checkbox-group 的标识，仅管理具有相同 onlyFor 属性的子复选框。
   * @locale.en Identifier for this checkbox-group; only child checkboxes with the matching onlyFor prop will be managed by this group.
   */
  onlyFor: PropString(),
  /**
   * @locale.zh-CN 是否纵向排列子复选框。
   * @locale.en Whether to arrange child checkboxes vertically.
   */
  vertical: PropBoolean(),
  /**
   * @locale.zh-CN 子复选框的显示样式，可选 'checkbox' 普通样式或 'card' 卡片样式，作用于全部子项。
   * @locale.en Visual style applied to all child checkboxes, either 'checkbox' (default) or 'card'.
   */
  type: PropString<'checkbox' | 'card'>(),
});

export type CheckboxGroupUpdateDetail = {
  value: any[];
  raw: Set<any>;
  allChecked: boolean;
  intermediate: boolean;
};

export const checkboxGroupEmits = createEmits<{
  update: CheckboxGroupUpdateDetail;
}>(['update']);

export type CheckboxSetupProps = ExtractPropTypes<typeof checkboxProps> & CommonProps;
export type CheckboxEventProps = GetEventPropsFromEmits<typeof checkboxEmits>;
export type CheckboxEventMap = GetEventMapFromEmits<typeof checkboxEmits>;
export type CheckboxProps = Partial<CheckboxSetupProps> & CheckboxEventProps;
export type CheckboxGroupSetupProps = ExtractPropTypes<typeof checkboxGroupProps> & CommonProps;
export type CheckboxGroupEventProps = GetEventPropsFromEmits<typeof checkboxGroupEmits>;
export type CheckboxGroupEventMap = GetEventMapFromEmits<typeof checkboxGroupEmits>;
export type CheckboxGroupProps = Partial<CheckboxGroupSetupProps> & CheckboxGroupEventProps;
