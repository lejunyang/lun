import { freeze } from '@lun-web/utils';
import {
  CommonProps,
  createEmits,
  editStateProps,
  GetEventMapFromEmits,
  GetEventPropsFromEmits,
  PropBoolean,
  PropObjOrStr,
  sizeProp,
  undefBoolProp,
} from 'common';
import { ExtractPropTypes } from 'vue';

export type DocPipAcceptStyle = string | CSSStyleSheet | HTMLStyleElement;

export const docPipProps = freeze({
  ...editStateProps,
  /**
   * @locale.zh-CN 控制画中画窗口的打开与关闭，不建议初始化时设为 true，浏览器要求用户先与页面交互。
   * @locale.en Controls whether the picture-in-picture window is open. Setting it to true on initial render is discouraged because browsers require a prior user gesture.
   */
  open: undefBoolProp,
  /**
   * @locale.zh-CN 画中画窗口的像素宽度，支持响应式断点对象，必须与 height 同时指定。
   * @locale.en Pixel width of the picture-in-picture window, supports responsive breakpoint objects. Must be specified together with height.
   */
  width: sizeProp,
  /**
   * @locale.zh-CN 画中画窗口的像素高度，支持响应式断点对象，必须与 width 同时指定。
   * @locale.en Pixel height of the picture-in-picture window, supports responsive breakpoint objects. Must be specified together with width.
   */
  height: sizeProp,
  /**
   * @locale.zh-CN 注入到画中画文档的额外样式，可为样式字符串、CSSStyleSheet、HTMLStyleElement 或它们的数组。
   * @locale.en Extra styles injected into the picture-in-picture document. Accepts a CSS string, CSSStyleSheet, HTMLStyleElement, or an array of these.
   */
  pipStyles: PropObjOrStr<DocPipAcceptStyle | DocPipAcceptStyle[]>(),
  /**
   * @locale.zh-CN 是否在画中画文档中用 l-theme-provider 包裹子节点，并复制当前位置的主题与编辑状态。
   * @locale.en Whether to wrap the cloned children in a l-theme-provider inside the picture-in-picture document, copying the current theme context and edit state.
   */
  wrapThemeProvider: PropBoolean(),
  /**
   * @locale.zh-CN 是否将主文档 styleSheets 中带有 ownerNode 的样式（如 link、style 节点）复制到画中画文档。
   * @locale.en Whether to copy styles from the main document's styleSheets that have an ownerNode (such as link and style nodes) into the picture-in-picture document.
   */
  copyDocStyleSheets: PropBoolean(),
});

export const docPipEmits = createEmits<{
  open: undefined;
  close: undefined;
}>(['open', 'close']);

export type DocPipSetupProps = ExtractPropTypes<typeof docPipProps> & CommonProps;
export type DocPipEventProps = GetEventPropsFromEmits<typeof docPipEmits>;
export type DocPipEventMap = GetEventMapFromEmits<typeof docPipEmits>;
export type DocPipProps = Partial<DocPipSetupProps> & DocPipEventProps;
