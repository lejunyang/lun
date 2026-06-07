import { DraggableFn, MaybePromise } from '@lun-web/core';
import { CSSProperties, ExtractPropTypes } from 'vue';
import {
  CommonProps,
  GetEventMapFromEmits,
  GetEventPropsFromEmits,
  OpenCloseEmits,
  Prop,
  PropBoolOrStr,
  PropBoolean,
  PropFunction,
  PropObjOrStr,
  PropObject,
  PropString,
  createEmits,
  createTransitionProps,
  editStateProps,
  openCloseEmits,
  sizeProp,
  themeProps,
  undefBoolProp,
} from 'common';
import { freeze } from '@lun-web/utils';
import { GetCustomRendererSource } from '../custom-renderer';

export const dialogProps = freeze({
  ...editStateProps,
  ...themeProps,
  ...createTransitionProps('panel', 'mask'),
  /**
   * @locale.zh-CN 控制弹框是否打开，支持 v-model。
   * @locale.en Controls whether the dialog is open. Supports v-model.
   */
  open: undefBoolProp,
  /**
   * @locale.zh-CN 弹框的渲染容器，可传入 HTMLElement 或 CSS 选择器字符串；仅在非 Top Layer 时生效。
   * @locale.en Container where the dialog is rendered, accepts an HTMLElement or a CSS selector string. Only effective when not in Top Layer mode.
   */
  container: PropObjOrStr<HTMLElement | string>(),
  /**
   * @locale.zh-CN 是否不渲染蒙层。
   * @locale.en Whether to hide the mask.
   */
  noMask: PropBoolean(),
  /**
   * @locale.zh-CN 是否不使用浏览器原生的 Top Layer 弹框。
   * @locale.en Whether to disable the browser's native Top Layer dialog.
   */
  noTopLayer: PropBoolean(),
  /**
   * @locale.zh-CN 是否始终在弹框内部限制焦点循环，即便使用了 Top Layer 弹框。
   * @locale.en Whether to always trap focus inside the dialog, even when using Top Layer dialog.
   */
  alwaysTrapFocus: PropBoolean(),
  /**
   * @locale.zh-CN 是否允许通过点击蒙层关闭弹框，可设为布尔值或指定触发事件类型。
   * @locale.en Whether clicking the mask closes the dialog. Accepts a boolean or the event type that triggers closing.
   */
  maskClosable: PropBoolOrStr<boolean | 'click' | 'dblclick'>(),
  /**
   * @locale.zh-CN 是否允许通过按下 Esc 键关闭弹框。
   * @locale.en Whether pressing the Escape key closes the dialog.
   * @default true
   */
  escapeClosable: PropBoolean(),
  /**
   * @locale.zh-CN 是否允许通过拖拽弹框头部来移动弹框。
   * @locale.en Whether the dialog header is draggable to move the dialog.
   */
  headerDraggable: PropBoolean(),
  /**
   * @locale.zh-CN 用于判定弹框内部哪些元素可被拖拽来移动弹框。
   * @locale.en Function used to determine which elements inside the dialog can be dragged to move it.
   */
  customDraggable: PropFunction<DraggableFn>(), // draggable is a html attribute, use customDraggable instead
  /**
   * @locale.zh-CN 拖拽时使用 left/top 定位而非 transform，避免影响内部固定定位子元素的包含块。
   * @locale.en Use left/top positioning instead of transform when dragging, to avoid changing the containing block of fixed descendants.
   */
  noTransform: PropBoolean(),
  /**
   * @locale.zh-CN 弹框面板的宽度，支持数字或 CSS 尺寸字符串。
   * @locale.en Width of the dialog panel. Accepts a number or a CSS size string.
   * @default '450px'
   */
  width: sizeProp,
  /**
   * @locale.zh-CN 弹框头部内容，支持自定义渲染。
   * @locale.en Dialog header content, supports custom renderers.
   */
  header: Prop<GetCustomRendererSource>(),
  /**
   * @locale.zh-CN 是否不渲染头部。
   * @locale.en Whether to hide the header.
   */
  noHeader: PropBoolean(),
  /**
   * @locale.zh-CN 是否不渲染右上角的关闭按钮。
   * @locale.en Whether to hide the close button in the top-right corner.
   */
  noCloseBtn: PropBoolean(),
  /**
   * @locale.zh-CN 透传给关闭按钮的属性。
   * @locale.en Props forwarded to the close button.
   */
  closeBtnProps: PropObject(),
  /**
   * @locale.zh-CN 弹框主体内容，支持自定义渲染。
   * @locale.en Dialog main content, supports custom renderers.
   */
  content: Prop<GetCustomRendererSource>(),
  /**
   * @locale.zh-CN 是否不渲染底部。
   * @locale.en Whether to hide the footer.
   */
  noFooter: PropBoolean(),
  /**
   * @locale.zh-CN 是否不渲染确认按钮。
   * @locale.en Whether to hide the OK button.
   */
  noOkBtn: PropBoolean(),
  /**
   * @locale.zh-CN 是否不渲染取消按钮。
   * @locale.en Whether to hide the Cancel button.
   */
  noCancelBtn: PropBoolean(),
  /**
   * @locale.zh-CN 确认按钮的文本。
   * @locale.en Text of the OK button.
   */
  okText: PropString(),
  /**
   * @locale.zh-CN 取消按钮的文本。
   * @locale.en Text of the Cancel button.
   */
  cancelText: PropString(),
  /**
   * @locale.zh-CN 透传给确认按钮的属性。
   * @locale.en Props forwarded to the OK button.
   */
  okBtnProps: PropObject(),
  /**
   * @locale.zh-CN 透传给取消按钮的属性。
   * @locale.en Props forwarded to the Cancel button.
   */
  cancelBtnProps: PropObject(),
  /**
   * @locale.zh-CN 打开弹框时是否不锁定页面或容器的滚动。
   * @locale.en Whether to skip locking page or container scroll when the dialog is open.
   */
  noLockScroll: PropBoolean(),
  /**
   * @locale.zh-CN 弹框面板的样式，其中的 width 优先级高于 width 属性。
   * @locale.en Style applied to the dialog panel. Its width takes priority over the width prop.
   */
  panelStyle: PropObject<CSSProperties>(),
  /**
   * @locale.zh-CN 蒙层的样式。
   * @locale.en Style applied to the mask.
   */
  maskStyle: PropObject<CSSProperties>(),
  /**
   * @locale.zh-CN 弹框打开前的回调，返回 false 可阻止打开。
   * @locale.en Callback invoked before opening the dialog. Return false to prevent opening.
   */
  beforeOpen: PropFunction<() => void | boolean>(),
  /**
   * @locale.zh-CN 点击确认按钮时的回调，返回 false、reject 的 Promise 或抛出错误时弹框保持打开且不会触发 ok 事件。
   * @locale.en Callback invoked when the OK button is clicked. Returning false, a rejected Promise, or throwing keeps the dialog open and suppresses the ok event.
   */
  beforeOk: PropFunction<() => MaybePromise<boolean | void>>(),
  /**
   * @locale.zh-CN 弹框关闭前的回调，返回 false、reject 的 Promise 或抛出错误时阻止关闭。
   * @locale.en Callback invoked before closing the dialog. Returning false, a rejected Promise, or throwing prevents closing.
   */
  beforeClose: PropFunction<() => MaybePromise<boolean | void>>(),
  /**
   * @locale.zh-CN 当 beforeOk 等异步回调处于 pending 状态时，是否禁用整个弹框。
   * @locale.en Whether to disable the entire dialog while async callbacks like beforeOk are pending.
   */
  disableWhenPending: PropBoolean(),

  /** @internal */
  isConfirm: PropBoolean(),
});

export const dialogEmits = createEmits<
  {
    update: boolean;
  } & OpenCloseEmits
>(['update', ...openCloseEmits]);

export type DialogSetupProps = ExtractPropTypes<typeof dialogProps> & CommonProps;
export type DialogEventProps = GetEventPropsFromEmits<typeof dialogEmits>;
export type DialogEventMap = GetEventMapFromEmits<typeof dialogEmits>;
export type DialogProps = Partial<DialogSetupProps> & DialogEventProps;
