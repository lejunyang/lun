import { InputPeriod, InputPeriodWithAuto, InputType } from '@lun-web/core';
import { ExtractPropTypes } from 'vue';
import {
  CommonProps,
  GetEventMapFromEmits,
  GetEventPropsFromEmits,
  Prop,
  PropBoolean,
  PropFunction,
  PropNumber,
  PropObjOrFunc,
  PropObjOrStr,
  PropStrOrArr,
  PropString,
  Status,
  createEmits,
  createTransitionProps,
  editStateProps,
  themeProps,
} from 'common';
import { TagProps } from '../tag/type';
import { Constructor, freeze, MaybeArray } from '@lun-web/utils';
import { AutoUpdateLabel } from './hooks';
import { GetCustomRendererSource } from '../custom-renderer';

export const baseInputProps = {
  ...editStateProps,
  /**
   * @locale.zh-CN 输入框的值，受控属性，多值时为数组。
   * @locale.en Input value. Controlled prop; an array when in multiple mode.
   */
  value: PropString(),
  /**
   * @locale.zh-CN 是否开启浏览器拼写检查。
   * @locale.en Enables native browser spellcheck.
   */
  spellcheck: PropBoolean(),
  /**
   * @locale.zh-CN 页面加载后是否自动聚焦输入框。
   * @locale.en Whether the input is auto-focused on mount.
   */
  autofocus: PropBoolean(),
  /**
   * @locale.zh-CN 输入框占位文本。
   * @locale.en Placeholder text for the input.
   */
  placeholder: PropString(),
  /**
   * @locale.zh-CN 是否必填，会作用于表单校验与可访问性属性。
   * @locale.en Marks the input as required for form validation and accessibility.
   */
  required: PropBoolean(),
  /**
   * @locale.zh-CN 输入框类型，例如 text、number、number-text、password 等。
   * @locale.en Input type, e.g. text, number, number-text, password.
   */
  type: PropString<InputType>(),
  /**
   * @locale.zh-CN 值更新时机，可选 input、notComposing、change、auto，亦可传入数组组合。auto 时多值等同 change，单值等同 notComposing。
   * @locale.en When the value is committed: input, notComposing, change, or auto (or an array of these). auto means change in multiple mode and notComposing otherwise.
   * @default 'auto'
   */
  updateWhen: PropStrOrArr<InputPeriodWithAuto | InputPeriodWithAuto[]>(),
  /**
   * @locale.zh-CN 更新事件的防抖时间，单位毫秒。
   * @locale.en Debounce delay for the update event, in milliseconds.
   */
  debounce: PropNumber(),
  /**
   * @locale.zh-CN 更新事件的节流时间，单位毫秒。
   * @locale.en Throttle interval for the update event, in milliseconds.
   */
  throttle: PropNumber(),
  /**
   * @locale.zh-CN 传递给 debounce/throttle 的额外选项。
   * @locale.en Extra options forwarded to debounce/throttle.
   */
  waitOptions: {},
  /**
   * @locale.zh-CN 是否在提交值时自动去除首尾空白。
   * @locale.en Whether to trim leading and trailing whitespace from the committed value.
   * @default true
   */
  trim: PropBoolean(),
  /**
   * @locale.zh-CN 最大输入长度。
   * @locale.en Maximum input length.
   */
  maxLength: PropNumber(),
  /**
   * @locale.zh-CN 多值时允许的最大标签数。
   * @locale.en Maximum number of tags allowed in multiple mode.
   */
  maxTags: PropNumber(),
  /**
   * @locale.zh-CN 字符限制规则，可传字符串或正则；配合 restrictWhen 决定生效时机。
   * @locale.en Character restriction rule; accepts a string or RegExp and is applied according to restrictWhen.
   */
  restrict: PropString(RegExp),
  /**
   * @locale.zh-CN 字符限制的触发时机，可选 beforeInput、input、notComposing、change，或这些值的数组。
   * @locale.en When character restriction is applied: beforeInput, input, notComposing, change, or an array of them.
   * @default 'notComposing'
   */
  restrictWhen: PropStrOrArr<InputPeriod | 'beforeInput' | (InputPeriod | 'beforeInput')[]>(),
  /**
   * @locale.zh-CN 当输入为空字符串时是否将值发出为 null。
   * @locale.en Whether to emit null when the input value is an empty string.
   */
  toNullWhenEmpty: PropBoolean(),
  /**
   * @locale.zh-CN 值转换函数，在更新事件触发前对值进行转换。
   * @locale.en Value transformer applied before the update event is emitted.
   */
  transform: PropFunction<(value: any) => any>(),
  /**
   * @locale.zh-CN 值转换的触发时机，可选 input、notComposing、change，或这些值的数组。
   * @locale.en When the transform runs: input, notComposing, change, or an array of them.
   * @default 'notComposing'
   */
  transformWhen: PropStrOrArr<InputPeriod | InputPeriod[]>(),
  /**
   * @locale.zh-CN 处于输入法 composition 状态时是否仍发出 enterDown 事件。
   * @locale.en Whether to emit enterDown even while an IME composition is in progress.
   */
  emitEnterDownWhenComposing: PropBoolean(),
};

export type BaseInputSetupProps = ExtractPropTypes<typeof baseInputProps>;
export type BaseInputProps = Partial<BaseInputSetupProps>;

export const inputProps = freeze({
  ...baseInputProps,
  ...themeProps,
  ...createTransitionProps('carouselLabel'),
  /**
   * @locale.zh-CN 输入框的值，多值模式下为数组；同时兼容数字与数字数组类型。
   * @locale.en Input value. Accepts an array in multiple mode and supports numeric values.
   */
  value: PropStrOrArr(Number as any as Constructor<number | number[]>),
  /**
   * @locale.zh-CN 是否启用多值输入，值会以数组形式存储并以标签展示。
   * @locale.en Enables multi-value input; values are stored as an array and rendered as tags.
   */
  multiple: PropBoolean(),
  /**
   * @locale.zh-CN 多值模式下是否禁止重复值，默认允许重复。
   * @locale.en Disallows duplicate values in multiple mode. Duplicates are allowed by default.
   */
  unique: PropBoolean(),
  /**
   * @locale.zh-CN 多值模式下标签是否换行展示，开启后输入框会被撑开。
   * @locale.en Wraps overflowing tags onto multiple lines in multiple mode; the input grows to fit.
   */
  wrapTags: PropBoolean(),
  /**
   * @locale.zh-CN 传给每个标签的属性，可为对象或返回对象的函数。
   * @locale.en Props passed to each tag; either an object or a function returning one.
   */
  tagProps: PropObjOrFunc<((value: any, index: number) => Omit<TagProps, 'removable'>) | Omit<TagProps, 'removable'>>(),
  /**
   * @locale.zh-CN 标签的自定义渲染器，可替换默认的 tag 元素。
   * @locale.en Custom renderer used in place of the default tag element.
   */
  tagRenderer:
    Prop<GetCustomRendererSource<[value: string | number, index: number, props: Record<string, unknown>], true>>(),
  /**
   * @locale.zh-CN 可编辑时是否在每个标签上展示删除图标。
   * @locale.en Whether to show a remove icon on each tag when editable.
   * @default true
   */
  tagRemoveIcon: PropBoolean(),
  /**
   * @locale.zh-CN 多值模式下用于分割输入字符串的分隔符，默认为空白字符或逗号。
   * @locale.en Separator used to split the typed string in multiple mode. Defaults to whitespace or comma.
   * @default /[\s,]/
   */
  separator: PropString(RegExp),
  /**
   * @locale.zh-CN 输入框标签内容，可传字符串或包含 interval 的自动更新对象。
   * @locale.en Label content; accepts a string or an auto-update object containing an interval.
   */
  label: PropObjOrStr<string | AutoUpdateLabel>(),
  /**
   * @locale.zh-CN 标签展示类型，float 为浮动标签，carousel 为轮播标签。
   * @locale.en Label style: float for a floating label, carousel for an animated rotating label.
   */
  labelType: PropString<'float' | 'carousel'>(),
  /**
   * @locale.zh-CN 是否在输入框旁展示当前字数信息，配合 maxLength 时一并展示上限。
   * @locale.en Shows the current character count next to the input; displays the limit when maxLength is set.
   */
  showLengthInfo: PropBoolean(),
  /**
   * @locale.zh-CN 是否在有值且可编辑时展示一键清空图标。
   * @locale.en Shows a clear icon when the input has a value and is editable.
   * @default true
   */
  showClearIcon: PropBoolean(),
  /**
   * @locale.zh-CN 输入框状态，例如 success、warning、error，用于校验态样式。
   * @locale.en Input status such as success, warning, or error for validation styling.
   */
  status: PropString<Status>(),
  /**
   * @locale.zh-CN 是否在状态非空时展示对应的状态图标。
   * @locale.en Whether to display the matching status icon when a status is set.
   */
  showStatusIcon: PropBoolean(),

  // ------------------ input number ------------------
  /**
   * @locale.zh-CN 数字输入框的步进器样式，up-down 为上下箭头，plus-minus 为加减按钮，其他值不展示步进器。
   * @locale.en Step control style for numeric input: up-down arrows, plus-minus buttons, or none.
   * @default 'up-down'
   */
  stepControl: PropString<'up-down' | 'plus-minus' | 'none'>(),
  /**
   * @locale.zh-CN 允许的最小值（可取等）。
   * @locale.en Minimum allowed value (inclusive).
   */
  min: PropNumber(),
  /**
   * @locale.zh-CN 允许的最大值（可取等）。
   * @locale.en Maximum allowed value (inclusive).
   */
  max: PropNumber(),
  /**
   * @locale.zh-CN 允许值必须大于的下界（不可取等）。
   * @locale.en Exclusive lower bound; the value must be strictly greater than this.
   */
  moreThan: PropNumber(),
  /**
   * @locale.zh-CN 允许值必须小于的上界（不可取等）。
   * @locale.en Exclusive upper bound; the value must be strictly less than this.
   */
  lessThan: PropNumber(),
  /**
   * @locale.zh-CN 数字精度，必须为非负整数；为 0 时不允许输入小数。
   * @locale.en Numeric precision; must be a non-negative integer. 0 forbids decimals.
   */
  precision: PropNumber(),
  /**
   * @locale.zh-CN 每次步进调整的数字大小，支持小数；为 0 时不修改值。
   * @locale.en Increment applied per step; supports decimals. 0 leaves the value unchanged.
   */
  step: PropNumber(),
  /**
   * @locale.zh-CN 是否启用严格模式，会按 step 和 precision 修正 min、max、moreThan、lessThan 等约束。
   * @locale.en Enables strict mode, which aligns min/max/moreThan/lessThan to step and precision.
   */
  strict: PropBoolean(),
  /**
   * @locale.zh-CN 是否禁止输入科学计数法（如 1e5、1.8E-3）。
   * @locale.en Disallows scientific-notation input such as 1e5 or 1.8E-3.
   */
  noExponent: PropBoolean(),
  /**
   * @locale.zh-CN 是否将中文句号替换为英文小数点，方便中文输入下输入小数。
   * @locale.en Replaces the Chinese full stop with a decimal point to ease decimal entry from IMEs.
   */
  replaceChPeriodMark: PropBoolean(),
  /**
   * @locale.zh-CN 是否在 change 事件中归一化数字，例如 1.2E2 转为 120、1.20 转为 1.2。
   * @locale.en Normalizes numbers on the change event, e.g. 1.2E2 becomes 120 and 1.20 becomes 1.2.
   * @default true
   */
  normalizeNumber: PropBoolean(),
  // ------------------ input number ------------------
});

export const inputEmits = createEmits<{
  update: MaybeArray<string | number> | null;
  /** only for multiple input, emit when value of inner input updates */
  tagsComposing: string | number;
  tagsAdd: string[] | number[];
  tagsRemove: string[] | number[];
  enterDown: KeyboardEvent;
}>(['update', 'tagsComposing', 'tagsAdd', 'tagsRemove', 'enterDown']);

export type InputSetupProps = ExtractPropTypes<typeof inputProps> & CommonProps;
export type InputEventProps = GetEventPropsFromEmits<typeof inputEmits>;
export type InputEventMap = GetEventMapFromEmits<typeof inputEmits>;
export type InputProps = Partial<InputSetupProps> & InputEventProps;
