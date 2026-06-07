import { ExtractPropTypes } from 'vue';
import {
  themeProps,
  GetEventPropsFromEmits,
  CommonProps,
  undefBoolProp,
  createTransitionProps,
  PropBoolean,
  PropString,
  editStateProps,
  PropObjOrStr,
  Prop,
  createEmits,
  OpenCloseEmits,
  openCloseEmits,
  GetEventMapFromEmits,
} from 'common';
import { freeze, MaybeArray, MaybeSet } from '@lun-web/utils';

export const accordionProps = freeze({
  ...themeProps,
  ...editStateProps,
  /**
   * @locale.zh-CN 折叠面板的标题内容，可传入字符串或渲染函数
   * @locale.en Header content of the accordion; accepts a string or a render function.
   */
  header: {},
  /**
   * @locale.zh-CN 折叠面板展开后显示的内容，可传入字符串或渲染函数
   * @locale.en Content displayed when the accordion is expanded; accepts a string or a render function.
   */
  content: {},
  ...createTransitionProps('content'),
  /**
   * @locale.zh-CN 是否展开当前折叠面板，可使用 v-model 进行双向绑定；位于 accordion-group 中时由父组件统一控制
   * @locale.en Whether the accordion is open; supports v-model. Ignored when nested inside accordion-group, which controls open state instead.
   */
  open: undefBoolProp,
  /**
   * @locale.zh-CN 当前折叠面板在 accordion-group 中的唯一标识，未设置时回退到子组件索引
   * @locale.en Unique identifier of the accordion within an accordion-group; falls back to the child index when omitted.
   */
  name: PropString(),
  /**
   * @locale.zh-CN 指示图标的位置，可选 start 或 end
   * @locale.en Position of the indicator icon, either start or end.
   * @default 'end'
   */
  iconPosition: PropString<'start' | 'end'>(),
  /**
   * @locale.zh-CN 指示图标的名称，可传字符串统一使用，或对象分别指定展开与折叠状态的图标
   * @locale.en Indicator icon name; pass a string to share one icon or an object to set distinct open and close icons.
   */
  iconName: PropObjOrStr<string | { open?: string; close?: string }>(),
  /**
   * @locale.zh-CN 指示图标所属的图标库，可传字符串统一使用，或对象分别指定展开与折叠状态的图标库
   * @locale.en Icon library for the indicator; pass a string for a shared library or an object to set distinct libraries for open and close states.
   */
  iconLibrary: PropObjOrStr<string | { open?: string; close?: string }>(),
});

export const accordionEmits = createEmits<
  {
    update: boolean;
  } & OpenCloseEmits
>(['update', ...openCloseEmits]);

export type AccordionSetupProps = ExtractPropTypes<typeof accordionProps> & CommonProps;
export type AccordionEventProps = GetEventPropsFromEmits<typeof accordionEmits>;
export type AccordionEventMap = GetEventMapFromEmits<typeof accordionEmits>;
export type AccordionProps = Partial<AccordionSetupProps> & AccordionEventProps;

type OpenType = string | number;

export const accordionGroupProps = freeze({
  ...themeProps,
  ...editStateProps,
  /**
   * @locale.zh-CN 当前展开的子面板标识，支持单值或多值集合，可使用 v-model 双向绑定
   * @locale.en Identifier(s) of currently expanded child accordions; accepts a single value or a collection and supports v-model.
   */
  open: Prop<MaybeArray<OpenType> | MaybeSet<OpenType>>(),
  /**
   * @locale.zh-CN 初始展开的子面板标识，仅在非受控模式下生效
   * @locale.en Identifier(s) of accordions to expand by default; used only in uncontrolled mode.
   */
  defaultOpen: Prop(),
  /**
   * @locale.zh-CN 是否允许同时展开多个子面板
   * @locale.en Whether multiple child accordions can be expanded at the same time.
   */
  allowMultiple: PropBoolean(),
});

export const accordionGroupEmits = createEmits<{
  update: { value: MaybeArray<OpenType> | null; raw: MaybeSet<OpenType> | null };
}>(['update']);

export type AccordionGroupSetupProps = ExtractPropTypes<typeof accordionGroupProps> & CommonProps;
export type AccordionGroupEventProps = GetEventPropsFromEmits<typeof accordionGroupEmits>;
export type AccordionGroupEventMap = GetEventMapFromEmits<typeof accordionGroupEmits>;
export type AccordionGroupProps = Partial<AccordionGroupSetupProps> & AccordionGroupEventProps;
