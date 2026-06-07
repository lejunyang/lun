import { freeze, TryGet } from '@lun-web/utils';
import { GetEventMapFromEmits, GetEventPropsFromEmits, PropBoolean, PropString } from 'common';
import { ExtractPropTypes, h } from 'vue';

export interface UserRegistry {
  // renderer: 'react'
}

export type CustomRendererType = 'vnode' | 'html' | 'text' | TryGet<UserRegistry, 'renderer'> | (string & {});

export const customRendererProps = freeze({
  /**
   * @locale.zh-CN 指定渲染的类型，默认支持 vnode、html 和 text，也可以是通过 registerCustomRenderer 注册的自定义类型；未指定时会根据 content 自动检测
   * @locale.en Specifies the render type. Built-in values are vnode, html and text, plus any custom type registered via registerCustomRenderer. When omitted, the type is detected from the content.
   */
  type: PropString<CustomRendererType>(),
  /**
   * @locale.zh-CN 当 content 为字符串等原始值且未指定 type 时，是否优先按 html 渲染而非文本
   * @locale.en When content is a raw value such as a string and type is not specified, prefer rendering it as html instead of plain text.
   */
  preferHtml: PropBoolean(),
  /**
   * @locale.zh-CN 需要渲染的内容，可为字符串、数字、Vnode、HTMLTemplateElement，或返回这些值的函数（函数参数可获取 Vue 的 h）
   * @locale.en The content to render. Accepts a string, number, Vnode, HTMLTemplateElement, or a getter function (which receives Vue's h as a parameter).
   */
  content: { required: true },
});

export const customRendererEmits = freeze({});

type Raw = string | number | boolean | object;
export type CustomRendererSource = {
  content: Raw | ((param: { h: typeof h }) => Raw);
  type?: CustomRendererType;
  preferHtml?: boolean;
} & Record<string, unknown>;

export type GetCustomRendererSource<T extends any[] = never, FuncOnly extends boolean = false> = FuncOnly extends true
  ? (...params: T) => CustomRendererSource
  : Raw | CustomRendererSource | (T extends any[] ? (...params: T) => CustomRendererSource : never);

export type CustomRendererSetupProps = ExtractPropTypes<typeof customRendererProps> & Record<string, any>;
export type CustomRendererEventProps = GetEventPropsFromEmits<typeof customRendererEmits>;
export type CustomRendererEventMap = GetEventMapFromEmits<typeof customRendererEmits>;
export type CustomRendererProps = Partial<CustomRendererSetupProps> & CustomRendererEventProps;
