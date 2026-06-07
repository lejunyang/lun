import { ExtractPropTypes } from 'vue';
import {
  GetEventPropsFromEmits,
  PropBoolOrFunc,
  valueProp,
  PropBoolean,
  PropObjOrBool,
  PropString,
  editStateProps,
  themeProps,
  PropObject,
  CommonProps,
  Prop,
  createEmits,
  GetEventMapFromEmits,
} from 'common';
import { popoverProps } from '../popover/type';
import { freeze, MaybeArray, MaybeSet, objectKeys, omit } from '@lun-web/utils';
import { CommonOption, createOptionProps } from 'hooks';
import { ButtonProps } from '../button/type';
import { GetCustomRendererSource } from '../custom-renderer';

export const selectPropsOfPopover = {
  ...omit(popoverProps, [
    'disabled', // must... in case it affect edit props
    'open',
    'content',
    'popWidth',
    'triggers',
    'showArrow',
    'defaultChildren',
    'toggleMode',
    'useTransform',
    'placement',
    ...objectKeys(themeProps),
  ]),
};

export const selectProps = freeze({
  ...themeProps,
  ...createOptionProps(true), // it includes editStateProps
  /**
   * @locale.zh-CN 选中的值，多选时为数组
   * @locale.en Selected value, an array when multiple is enabled
   */
  value: Prop(),
  /**
   * @locale.zh-CN 是否开启多选
   * @locale.en Whether to enable multiple selection
   */
  multiple: PropBoolean(),
  /**
   * @locale.zh-CN 是否启用过滤，传入函数可自定义过滤逻辑
   * @locale.en Whether to enable filtering; pass a function for custom filter logic
   */
  filter: PropBoolOrFunc<boolean | ((inputValue: string | null, option: CommonOption) => boolean)>(),
  /**
   * @locale.zh-CN 是否允许自由输入以创建新的选项
   * @locale.en Whether to allow free input to create new options
   */
  freeInput: PropBoolean(),

  /**
   * @locale.zh-CN 点击选项时执行切换还是仅选中，仅对单选生效，多选始终为 toggle
   * @locale.en Whether clicking an option toggles or only selects; only applies to single select, multiple is always toggle
   */
  clickOption: PropString<'toggle' | 'select'>(),
  /**
   * @locale.zh-CN 单选时选中选项后是否自动关闭弹层
   * @locale.en Whether to auto close the popover after selecting an option in single select mode
   * @default true
   */
  autoClose: PropBoolean(),
  /**
   * @locale.zh-CN 多选时是否在弹层中隐藏已选中的选项
   * @locale.en In multiple select mode, hide already selected options in the popover
   */
  hideOptionWhenSelected: PropBoolean(),
  /**
   * @locale.zh-CN 多选时弹层内的常用按钮配置，支持布尔值或按按钮名分别配置 Button 属性
   * @locale.en Common buttons inside the popover for multiple select; accepts boolean or per-button Button props
   */
  commonButtons: PropObjOrBool<boolean | Record<'selectAll' | 'reverse' | 'clear', ButtonProps | boolean>>(),

  /**
   * @locale.zh-CN 弹层打开时是否自动激活第一个选项
   * @locale.en Whether to automatically activate the first option when the popover opens
   * @default true
   */
  autoActivateFirst: PropBoolean(),
  /**
   * @locale.zh-CN 按上下方向键时是否在选项间循环切换
   * @locale.en Whether the up/down arrow keys cycle through options
   * @default true
   */
  upDownToggle: PropBoolean(),
  ...selectPropsOfPopover,
});

export const selectEmits = createEmits<{
  update: { value: MaybeArray<unknown> | null; raw: MaybeSet<unknown> | null };
  inputUpdate: string | null;
}>(['update', 'inputUpdate']);

export const selectOptionProps = freeze({
  ...themeProps,
  ...editStateProps,
  /**
   * @locale.zh-CN 选项的值
   * @locale.en The value of the option
   */
  value: valueProp,
  /**
   * @locale.zh-CN 选项的显示文本，用于过滤匹配
   * @locale.en Display label of the option, also used for filter matching
   */
  label: PropString(),
  /**
   * @locale.zh-CN 是否将该选项排除在 select 的选项集合之外
   * @locale.en Whether to exclude this option from the parent select's option set
   */
  excludeFromSelect: PropBoolean(),
  /**
   * @locale.zh-CN 自定义渲染内容，若有值则使用 CustomRenderer 渲染并忽略 label，但 label 仍用于过滤
   * @locale.en Custom content renderer; when truthy CustomRenderer is used and label is not rendered, but label is still used for filtering
   */
  content: Prop<GetCustomRendererSource>(),
  /**
   * @locale.zh-CN 是否隐藏该选项
   * @locale.en Whether to hide this option
   */
  hidden: PropBoolean(),
  /** @internal */
  selectContext: PropObject(),
});

export const selectOptionEmits = freeze({});

export const selectOptgroupProps = freeze({
  ...themeProps,
  ...editStateProps,
  /**
   * @locale.zh-CN 选项分组的标题
   * @locale.en Label of the option group
   */
  label: PropString(),
  /** @internal */
  selectContext: PropObject(),
});

export const selectOptgroupEmits = freeze({});

export type SelectSetupProps = ExtractPropTypes<typeof selectProps> & CommonProps;
export type SelectEventProps = GetEventPropsFromEmits<typeof selectEmits>;
export type SelectEventMap = GetEventMapFromEmits<typeof selectEmits>;
export type SelectProps = Partial<SelectSetupProps> & SelectEventProps;

export type SelectOptionSetupProps = ExtractPropTypes<typeof selectOptionProps> & CommonProps;
export type SelectOptionEventProps = GetEventPropsFromEmits<typeof selectOptionEmits>;
export type SelectOptionEventMap = GetEventMapFromEmits<typeof selectOptionEmits>;
export type SelectOptionProps = Partial<SelectOptionSetupProps> & SelectOptionEventProps;

export type SelectOptgroupSetupProps = ExtractPropTypes<typeof selectOptgroupProps> & CommonProps;
export type SelectOptgroupEventProps = GetEventPropsFromEmits<typeof selectOptgroupEmits>;
export type SelectOptgroupEventMap = GetEventMapFromEmits<typeof selectOptgroupEmits>;
export type SelectOptgroupProps = Partial<SelectOptgroupSetupProps> & SelectOptgroupEventProps;
