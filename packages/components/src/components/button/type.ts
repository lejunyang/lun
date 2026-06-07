import { ExtractPropTypes } from 'vue';
import {
  editStateProps,
  themeProps,
  LogicalPosition,
  GetEventPropsFromEmits,
  PropString,
  PropFunction,
  PropObject,
  PropBoolean,
  PropNumber,
  PropResponsive,
  CommonProps,
  Prop,
  createEmits,
  GetEventMapFromEmits,
} from 'common';
import { freeze } from '@lun-web/utils';
import { MaybeRefLikeOrGetter } from '@lun-web/core';

export const buttonProps = freeze({
  ...editStateProps,
  ...themeProps,
  /**
   * @locale.zh-CN 是否为块级按钮，占据父容器的整行宽度
   * @locale.en Whether the button is block-level, taking up the full width of its parent container
   */
  block: PropBoolean(),
  /**
   * @locale.zh-CN 按钮尺寸，支持响应式配置
   * @locale.en Button size, supports responsive configuration
   */
  size: PropResponsive<'1' | '2' | '3' | '4'>(),
  /**
   * @locale.zh-CN 按钮文本，优先级低于默认插槽
   * @locale.en Button text, has lower priority than the default slot
   */
  label: PropString(),
  /**
   * @locale.zh-CN 异步点击处理函数，若返回 Promise，按钮会自动进入 loading 状态直至 Promise 完成
   * @locale.en Async click handler. If it returns a Promise, the button enters the loading state until the Promise settles
   */
  asyncHandler: PropFunction<(e?: MouseEvent) => void>(),
  /**
   * @locale.zh-CN 传递给内部 spin 加载组件的属性
   * @locale.en Props passed to the internal spin loading component
   */
  spinProps: PropObject(),
  /**
   * @locale.zh-CN 加载状态下是否显示 spin 或倒计时文本
   * @locale.en Whether to display the spin or countdown text when in loading state
   * @default true
   */
  showLoading: PropBoolean(),
  /**
   * @locale.zh-CN 图标（或加载状态文本）相对于按钮内容的位置
   * @locale.en Position of the icon (or loading text) relative to the button content
   * @default 'start'
   */
  iconPosition: PropString<LogicalPosition>(),
  /**
   * @locale.zh-CN 点击事件的防抖时间，单位为毫秒
   * @locale.en Debounce time for the click event, in milliseconds
   */
  debounce: PropNumber(),
  /**
   * @locale.zh-CN 点击事件的节流时间，单位为毫秒
   * @locale.en Throttle time for the click event, in milliseconds
   */
  throttle: PropNumber(),
  /**
   * @locale.zh-CN 按住模式所需的按住时长，单位为毫秒。设置后需按住按钮达到该时长才会触发点击
   * @locale.en Required hold duration in milliseconds for hold-mode. When set, the click is triggered only after the button is held for the specified duration
   */
  hold: PropNumber(),
  /**
   * @locale.zh-CN 按钮图标名称，将渲染对应的 icon 组件
   * @locale.en Name of the button icon, which will render the corresponding icon component
   */
  iconName: PropString(),
  /**
   * @locale.zh-CN 按钮图标所属的图标库
   * @locale.en Icon library that the button icon belongs to
   */
  iconLibrary: PropString(),
  /**
   * @locale.zh-CN 若设置，点击按钮时会将该值复制到剪贴板
   * @locale.en If specified, the value will be copied to the clipboard when the button is clicked
   */
  copyText: Prop<MaybeRefLikeOrGetter<string>>(),
});

export const buttonEmits = createEmits<{
  validClick: undefined;
  timeout: undefined;
  copySuccess: undefined;
  copyFail: Error | undefined;
}>(['validClick', 'timeout', 'copySuccess', 'copyFail']);

export type ButtonSetupProps = ExtractPropTypes<typeof buttonProps> & CommonProps;
export type ButtonEventProps = GetEventPropsFromEmits<typeof buttonEmits>;
export type ButtonEventMap = GetEventMapFromEmits<typeof buttonEmits>;
export type ButtonProps = Partial<ButtonSetupProps> & ButtonEventProps;
