import { MaybeRefLikeOrGetter } from '@lun/core';
import { freeze } from '@lun/utils';
import { GetEventPropsFromEmits, PropString, CommonProps, PropBoolean, PropFunction, Prop } from 'common';
import { ExtractPropTypes } from 'vue';

export type ScrollViewSlot = {
  show: boolean;
  name: string;
  enterAnimation?: Parameters<typeof HTMLElement.prototype.animate>;
  leaveAnimation?: Parameters<typeof HTMLElement.prototype.animate>;
};

export type ScrollViewObserveViewRangeValue = number | 'cover' | 'contain' | 'entry' | 'exit' | `${number}%`;
export type ScrollViewObserveViewRangeOption =
  | [ScrollViewObserveViewRangeValue, ScrollViewObserveViewRangeValue]
  | ScrollViewObserveViewRangeValue
  | [ScrollViewObserveViewRangeValue];
export type ScrollViewObserveViewOption = {
  attribute: string;
  target?: MaybeRefLikeOrGetter<string | Element>;
  range?: ScrollViewObserveViewRangeOption;
  axis?: 'x' | 'y';
  progressVarName: string;
  intersectionCallback?: (entry: IntersectionObserverEntry) => void;
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
  /** 是否在x轴向前滚动了 */
  xForward: boolean;
  /** 是否在x轴向后滚动了 */
  xBackward: boolean;
  yForward: boolean;
  yBackward: boolean;
  /** x轴滚动百分比, 0-1 */
  scrollXProgress: number;
  scrollYProgress: number;
};

export const scrollViewProps = freeze({
  // maybe rename to scroller
  /** keyword(window), selector or element to watch for scroll events */
  target: Prop<MaybeRefLikeOrGetter<string | HTMLElement>>(),
  observeResize: PropBoolean(),
  scrollXProgressVarName: PropString(),
  scrollYProgressVarName: PropString(),
  observeView: Prop<ScrollViewObserveViewOption | ScrollViewObserveViewOption[]>(),
  hideScrollBar: PropBoolean(),
  getSlots: PropFunction<(state: any, oldResult: ScrollViewSlot[] | undefined) => ScrollViewSlot[] | ScrollViewSlot>(),
});

export const scrollViewEmits = freeze({});

export type ScrollViewSetupProps = ExtractPropTypes<typeof scrollViewProps> & CommonProps;
export type ScrollViewEvents = GetEventPropsFromEmits<typeof scrollViewEmits>;
export type ScrollViewProps = Partial<ScrollViewSetupProps> & ScrollViewEvents;
