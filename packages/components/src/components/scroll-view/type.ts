import { MaybeRefLikeOrGetter } from '@lun-web/core';
import { freeze } from '@lun-web/utils';
import {
  GetEventPropsFromEmits,
  PropString,
  CommonProps,
  PropBoolean,
  PropFunction,
  Prop,
  PropNumber,
  GetEventMapFromEmits,
} from 'common';
import { ExtractPropTypes } from 'vue';

export type ScrollViewSlot = {
  show: boolean;
  name: string;
  enterAnimation?: Parameters<typeof HTMLElement.prototype.animate>;
  leaveAnimation?: Parameters<typeof HTMLElement.prototype.animate>;
};

export type ScrollViewInsetValue = number | `${number}%` | 'auto'; // needs to consider scroll-padding for auto;
export type ScrollViewRangeValue = number | 'cover' | 'contain' | 'entry' | 'exit' | `${number}%`;
export type ScrollViewObserveViewRangeOption =
  | [ScrollViewRangeValue, ScrollViewRangeValue]
  | ScrollViewRangeValue
  | [ScrollViewRangeValue];
export type ScrollViewObserveViewOption = {
  target?: MaybeRefLikeOrGetter<string | Element>;
  range?: ScrollViewObserveViewRangeOption;
  inset?: ScrollViewInsetValue | [ScrollViewInsetValue] | [ScrollViewInsetValue, ScrollViewInsetValue];
  axis?: 'x' | 'y';
  progressVarName: string;
  onUpdate?: (progress: number, target: Element) => void;
};

export type ScrollViewState = {
  width: number;
  height: number;
  /** left corner's x of scroll container */
  x: number;
  /** left corner'y x of scroll container */
  y: number;
  /** x轴滚动距离 */
  scrollX: number;
  scrollY: number;
  scrolling: boolean;
  /** x轴是否溢出 */
  xOverflow: boolean;
  yOverflow: boolean;
  /** if last scroll on x axis was forward */
  xForward: boolean;
  /** 是否在x轴向后滚动了 */
  xBackward: boolean;
  yForward: boolean;
  yBackward: boolean;
  /** x轴滚动百分比, 0~1 */
  scrollXProgress: number;
  scrollYProgress: number;
};

export const scrollViewProps = freeze({
  // maybe rename to scroller
  /**
   * @locale.zh-CN 滚动监听目标，可传入关键字 window、CSS 选择器或元素，未设置时监听组件自身
   * @locale.en Scroll target to observe; accepts the keyword window, a CSS selector, or an element. Defaults to the component itself when unset
   */
  target: Prop<MaybeRefLikeOrGetter<string | HTMLElement>>(),
  /**
   * @locale.zh-CN 是否监听滚动容器的尺寸变化，开启后会通过 ResizeObserver 更新内部状态
   * @locale.en Whether to observe scroll container size changes via ResizeObserver and update the internal state accordingly
   */
  observeResize: PropBoolean(),
  /**
   * @locale.zh-CN 用于映射 x 轴滚动进度的 CSS 变量名，浏览器支持时会自动注册为数值类型自定义属性
   * @locale.en CSS variable name that exposes the x-axis scroll progress; auto-registered as a numeric custom property when supported
   * @default 'scroll-x-progress'
   */
  scrollXProgressVarName: PropString(),
  /**
   * @locale.zh-CN 用于映射 y 轴滚动进度的 CSS 变量名，浏览器支持时会自动注册为数值类型自定义属性
   * @locale.en CSS variable name that exposes the y-axis scroll progress; auto-registered as a numeric custom property when supported
   * @default 'scroll-y-progress'
   */
  scrollYProgressVarName: PropString(),
  /**
   * @locale.zh-CN 滚动进度或视图进度的更新阈值，进度变化小于该值时不会触发更新
   * @locale.en Threshold for updating scroll or view progress; changes smaller than this value will not trigger updates
   * @default 0.0001
   */
  threshold: PropNumber(),
  /**
   * @locale.zh-CN 配置一个或多个视图滚动监听目标，目标视图进入滚动容器时会更新对应 CSS 变量或触发回调
   * @locale.en One or more view-tracking configurations; updates the corresponding CSS variable or invokes the callback as a target moves through the scroll container
   */
  observeView: Prop<ScrollViewObserveViewOption | ScrollViewObserveViewOption[]>(),
  /**
   * @locale.zh-CN 是否隐藏滚动容器的滚动条
   * @locale.en Whether to hide the scrollbar of the scroll container
   */
  hideScrollBar: PropBoolean(),
  /**
   * @locale.zh-CN 根据当前滚动状态与视图进度动态生成插槽配置的函数，可决定插槽是否展示及切换时的动画
   * @locale.en Function that derives slot configurations from the current scroll state and view progress, controlling slot visibility and enter/leave animations
   */
  getSlots:
    PropFunction<
      (
        state: ScrollViewState,
        viewProgress: Record<string, number>,
        oldResult: ScrollViewSlot[] | undefined,
      ) => ScrollViewSlot[] | ScrollViewSlot
    >(),
});

export const scrollViewEmits = freeze({});

export type ScrollViewSetupProps = ExtractPropTypes<typeof scrollViewProps> & CommonProps;
export type ScrollViewEventProps = GetEventPropsFromEmits<typeof scrollViewEmits>;
export type ScrollViewEventMap = GetEventMapFromEmits<typeof scrollViewEmits>;
export type ScrollViewProps = Partial<ScrollViewSetupProps> & ScrollViewEventProps;
