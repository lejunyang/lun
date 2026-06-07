import {
  editStateProps,
  themeProps,
  LogicalPosition,
  GetEventPropsFromEmits,
  valueProp,
  PropString,
  PropBoolean,
  CommonProps,
  undefBoolProp,
  createEmits,
  GetEventMapFromEmits,
} from 'common';
import { ExtractPropTypes } from 'vue';
import { createOptionProps } from '../../hooks/useOptions';
import { freeze } from '@lun-web/utils';

export const radioProps = freeze({
  ...editStateProps,
  ...themeProps,
  /**
   * @locale.zh-CN 单选框对应的值，被选中时会作为 radio-group 的当前值
   * @locale.en The value bound to this radio; becomes the radio-group's current value when selected.
   */
  value: valueProp,
  /**
   * @locale.zh-CN 单选框旁显示的文本标签，未设置插槽时使用
   * @locale.en Text label displayed next to the radio when no default slot is provided.
   */
  label: PropString(),
  /**
   * @locale.zh-CN 标签相对于指示器的位置，可选 'start' 或 'end'
   * @locale.en Position of the label relative to the indicator, either 'start' or 'end'.
   * @default 'end'
   */
  labelPosition: PropString<LogicalPosition>(),
  /**
   * @locale.zh-CN 是否选中，仅在脱离 radio-group 独立使用时生效
   * @locale.en Whether the radio is checked; only takes effect when used standalone (outside a radio-group).
   */
  checked: PropBoolean(),
  /**
   * @locale.zh-CN 是否隐藏选中指示器圆点
   * @locale.en Whether to hide the selection indicator dot.
   */
  noIndicator: undefBoolProp, // virtualMerge requires undefined as default

  /**
   * @locale.zh-CN 在 type="button" 的 radio-group 中，标记该项为按钮组的起始项以应用对应圆角与边框样式
   * @locale.en In a button-type radio-group, marks this item as the start of the button group so the matching border and radius styles apply.
   */
  start: PropBoolean(),
  /**
   * @locale.zh-CN 在 type="button" 的 radio-group 中，标记该项为按钮组的结束项以应用对应圆角与边框样式
   * @locale.en In a button-type radio-group, marks this item as the end of the button group so the matching border and radius styles apply.
   */
  end: PropBoolean(),
});

export const radioEmits = createEmits<{
  update: unknown;
}>(['update']);

export type RadioSetupProps = ExtractPropTypes<typeof radioProps>;
export type RadioEventProps = GetEventPropsFromEmits<typeof radioEmits>;
export type RadioEventMap = GetEventMapFromEmits<typeof radioEmits>;
export type RadioProps = Partial<RadioSetupProps> & RadioEventProps;

export const radioGroupProps = freeze({
  ...createOptionProps(false),
  ...themeProps,
  /**
   * @locale.zh-CN 当前选中的值，对应某个子 radio 的 value
   * @locale.en The currently selected value, matching the value of one child radio.
   */
  value: valueProp,
  /**
   * @locale.zh-CN 单选组的外观类型，可选 'radio'、'button' 或 'card'
   * @locale.en Visual variant of the group, one of 'radio', 'button', or 'card'.
   */
  type: PropString<'radio' | 'button' | 'card'>(),

  /**
   * @locale.zh-CN 是否隐藏组内所有 radio 的选中指示器
   * @locale.en Whether to hide the selection indicator dot for every radio inside the group.
   */
  noIndicator: PropBoolean(),
  /**
   * @locale.zh-CN 组内 radio 的标签位置，会被透传到每个 radio 上
   * @locale.en Label position applied to every radio in the group.
   */
  labelPosition: PropString<LogicalPosition>(),
});

export const radioGroupEmits = createEmits<{
  update: unknown;
}>(['update']);

export type RadioGroupSetupProps = ExtractPropTypes<typeof radioGroupProps> & CommonProps;
export type RadioGroupEventProps = GetEventPropsFromEmits<typeof radioGroupEmits>;
export type RadioGroupEventMap = GetEventMapFromEmits<typeof radioGroupEmits>;
export type RadioGroupProps = Partial<RadioGroupSetupProps> & RadioGroupEventProps;
