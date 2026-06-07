import { freeze } from '@lun-web/utils';
import {
  CommonProps,
  createEmits,
  editStateProps,
  GetEventMapFromEmits,
  GetEventPropsFromEmits,
  PropBoolean,
  PropFunction,
  PropNumber,
  PropNumOrArr,
  PropObject,
  PropString,
} from 'common';
import { CSSProperties, ExtractPropTypes } from 'vue';

export const rangeProps = freeze({
  ...editStateProps,
  /**
   * @locale.zh-CN 当前值，单个数字代表单滑块，数组代表多滑块连续范围。
   * @locale.en Current value; a single number for a single thumb, or an array for multi-thumb continuous range.
   */
  value: PropNumOrArr(),
  /**
   * @locale.zh-CN 滑块朝向，水平或垂直。
   * @locale.en Slider orientation, horizontal or vertical.
   * @default 'horizontal'
   */
  type: PropString<'horizontal' | 'vertical'>(),
  /**
   * @locale.zh-CN 值的类型，`number-text` 用字符串承载值以支持大数和高精度小数。
   * @locale.en Value type; use `number-text` to carry values as strings for big numbers and high-precision decimals.
   */
  valueType: PropString<'number' | 'number-text'>(),
  /**
   * @locale.zh-CN 最小值。
   * @locale.en Minimum value.
   * @default 0
   */
  min: PropNumber(),
  /**
   * @locale.zh-CN 最大值。
   * @locale.en Maximum value.
   * @default 100
   */
  max: PropNumber(),
  /**
   * @locale.zh-CN 步长。
   * @locale.en Step size.
   * @default 1
   */
  step: PropNumber(),
  /**
   * @locale.zh-CN 数值精度（保留的小数位数），未指定时取 step 的小数位数。
   * @locale.en Numeric precision (decimal places); falls back to step's decimal places when unset.
   */
  precision: PropNumber(),
  /**
   * @locale.zh-CN 严格模式，开启后只允许值落在 step 的整数倍上。
   * @locale.en Strict mode; when enabled values must align to integer multiples of step.
   */
  strict: PropBoolean(),
  /**
   * @locale.zh-CN 刻度标记，键为标记的数字位置（也可为 `start` 或 `end`），值为标记内容。
   * @locale.en Tick labels; key is the numeric position (or `start`/`end`), value is the label content.
   */
  labels: PropObject<Record<string | number, string>>(),
  /**
   * @locale.zh-CN 当 value 为数组时，是否允许直接拖拽轨道整体移动多值。
   * @locale.en When value is an array, allows dragging the track as a whole to shift multiple values together.
   */
  trackDraggable: PropBoolean(),
  /**
   * @locale.zh-CN 透传给内部 tooltip 组件的属性。
   * @locale.en Props forwarded to the internal tooltip component.
   */
  tooltipProps: PropObject(),
  /**
   * @locale.zh-CN 自定义 tooltip 显示内容的格式化函数。
   * @locale.en Formatter function customizing the tooltip display content.
   */
  tooltipFormatter: PropFunction<(value: string) => string>(),
  /**
   * @locale.zh-CN 是否隐藏滑块上的 tooltip。
   * @locale.en Whether to hide the tooltip on thumbs.
   */
  noTooltip: PropBoolean(),
  /**
   * @locale.zh-CN 轨道底色（rail）的自定义样式。
   * @locale.en Custom styles for the rail (background track).
   */
  railStyle: PropObject<CSSProperties>(),
  /**
   * @locale.zh-CN 已选范围轨道（track）的自定义样式。
   * @locale.en Custom styles for the selected range track.
   */
  trackStyle: PropObject<CSSProperties>(),
});

export const rangeEmits = createEmits<{
  update: number | number[];
}>(['update']);

export type RangeSetupProps = ExtractPropTypes<typeof rangeProps> & CommonProps;
export type RangeEventProps = GetEventPropsFromEmits<typeof rangeEmits>;
export type RangeEventMap = GetEventMapFromEmits<typeof rangeEmits>;
export type RangeProps = Partial<RangeSetupProps> & RangeEventProps;
