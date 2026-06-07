import { ExtractPropTypes, CSSProperties } from 'vue';
import {
  GetEventPropsFromEmits,
  editStateProps,
  themeProps,
  PropObjOrFunc,
  PropObject,
  PropBoolean,
  PropString,
  sizeProp,
  PropResponsive,
  CommonProps,
  undefBoolProp,
  createEmits,
  PropObjOrStr,
  GetEventMapFromEmits,
} from 'common';
import type { CollectorContext, MaybeRefLikeOrGetter, UseFormReturn } from '@lun-web/core';
import { FormItemSetupProps, ValidateMessages, Validator } from '../form-item/type';
import { FormProvideExtra } from '.';
import { freeze } from '@lun-web/utils';

export interface FormValidators {
  [key: string]: Validator[] | Validator | FormValidators;
}

export const formProps = freeze({
  ...editStateProps,
  ...themeProps,
  /**
   * @locale.zh-CN 表单根元素的样式，可为字符串或样式对象
   * @locale.en Style applied to the form root element. Accepts a CSS string or a style object.
   */
  rootStyle: PropObjOrStr<string | CSSProperties>(),
  // intent to use prop `form` originally, but found `form` will be considered as a string attribute. It's vue's behavior, see vuejs/core/packages/runtime-dom/src/patchProp.ts. use `instance` instead
  /**
   * @locale.zh-CN 通过 useForm 创建的表单实例，用于管控表单数据、状态、方法与事件。未传入时内部会自动创建
   * @locale.en Form instance created by useForm that manages data, state, methods and events. One is created internally when not provided.
   */
  instance: PropObject<MaybeRefLikeOrGetter<UseFormReturn>>(),
  /**
   * @locale.zh-CN 在内部自动创建表单实例时使用的默认数据
   * @locale.en Default data used when the form instance is created internally.
   */
  defaultData: PropObject(),
  /**
   * @locale.zh-CN 在内部自动创建表单实例时使用的默认表单状态
   * @locale.en Default form state used when the form instance is created internally.
   */
  defaultFormState: PropObject(),
  /**
   * @locale.zh-CN 决定当前表单下所有 form-item 的 name 是否为普通字符串路径，开启后不会再尝试将其解析为嵌套路径。form-item 自身的 plainName 优先级更高
   * @locale.en Whether form-item names under this form are treated as plain string paths instead of nested paths. The form-item's own plainName takes precedence.
   */
  plainName: undefBoolProp,
  /**
   * @locale.zh-CN 表单的统一校验规则，按字段名进行组织，支持嵌套
   * @locale.en Form-level validators keyed by field name, with nested structures supported.
   */
  validators: PropObject<FormValidators>(),
  /**
   * @locale.zh-CN 校验的提前停止策略：'first-error' 表示出现第一个错误就停止；'first-item' 表示执行完出错 form-item 的所有 validator 再停止
   * @locale.en Early-stop strategy for validation. 'first-error' stops at the first error; 'first-item' finishes all validators of the failing form-item before stopping.
   */
  stopValidate: PropString<'first-error' | 'first-item'>(),
  /**
   * @locale.zh-CN 校验失败时是否滚动到第一个出错字段
   * @locale.en Whether to scroll to the first errored field after validation fails.
   */
  scrollToFirstError: PropBoolean(),
  /**
   * @locale.zh-CN 校验失败时使用的默认提示信息模板，可按校验规则名定制
   * @locale.en Default validation message templates, customizable per rule name.
   */
  validateMessages: PropObject<ValidateMessages>(),

  /**
   * @locale.zh-CN 表单布局方式，支持响应式断点配置
   * @locale.en Form layout mode. Supports responsive breakpoint values.
   * @default 'grid'
   */
  layout: PropResponsive<'flex' | 'grid' | 'inline-flex' | 'inline-grid'>(),
  /**
   * @locale.zh-CN 浏览器支持时优先使用 CSS Subgrid 实现 form-item 的跨列布局，仅在 labelLayout 为 horizontal 时有区别
   * @locale.en When supported, prefer CSS Subgrid for form-item column spans. Only meaningful when labelLayout is 'horizontal'.
   * @default true
   */
  preferSubgrid: PropBoolean(),
  /**
   * @locale.zh-CN 表单标签的布局方式：horizontal 标签与输入元素同行，vertical 标签在输入元素上方，none 不显示标签相关内容。支持响应式断点配置
   * @locale.en Label layout. 'horizontal' places the label inline with the input, 'vertical' above it, 'none' hides label-related content. Supports responsive breakpoints.
   * @default 'horizontal'
   */
  labelLayout: PropResponsive<'horizontal' | 'vertical' | 'float' | 'placeholder' | 'none'>(),
  /**
   * @locale.zh-CN 标签宽度。grid 布局下作用于 grid-template-columns，flex 布局下作用于 flex-basis。grid 布局默认为 max-content。支持响应式断点配置
   * @locale.en Label width. Applies to grid-template-columns under grid layout and flex-basis under flex layout. Defaults to max-content for grid. Supports responsive breakpoints.
   */
  labelWidth: PropResponsive<string>(),
  /**
   * @locale.zh-CN 表单的列数
   * @locale.en Number of columns the form uses.
   * @default '1'
   */
  cols: sizeProp,

  /**
   * @locale.zh-CN 为表单下所有 form-item 设置公共属性，也可传入函数以根据上下文动态生成。注意 deps 属性会被忽略，因为它应在 form-item 自身设置
   * @locale.en Common props shared by every child form-item. May be a function that derives props from context. The 'deps' prop is ignored because it must be set on the form-item itself.
   */
  itemProps: PropObjOrFunc<
    | Partial<FormItemSetupProps>
    | ((params: {
        formContext: CollectorContext<any, FormItemSetupProps, FormProvideExtra>;
        formItemProps: FormItemSetupProps;
      }) => Partial<FormItemSetupProps>)
  >(),
});

export const formEmits = createEmits<{
  update: { data: Record<string, any>; path: string[] | string; value: any; isDelete?: boolean };
}>(['update']);

export type FormSetupProps = ExtractPropTypes<typeof formProps> & CommonProps;
export type FormEventProps = GetEventPropsFromEmits<typeof formEmits>;
export type FormEventMap = GetEventMapFromEmits<typeof formEmits>;
export type FormProps = Omit<Partial<FormSetupProps>, 'itemProps'> & {
  itemProps?:
    | Partial<Omit<FormItemSetupProps, 'deps'>>
    | ((params: {
        formContext: CollectorContext<FormSetupProps, FormItemSetupProps, FormProvideExtra> | undefined;
        formItemProps: FormItemSetupProps;
      }) => Partial<Omit<FormItemSetupProps, 'deps'>>);
} & FormEventProps;
