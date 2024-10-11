import { freeze } from '@lun/utils';
import { GetEventPropsFromEmits, PropString, CommonProps, PropBoolean, PropNumOrArr, PropFunction } from 'common';
import { ExtractPropTypes } from 'vue';

export type ScrollViewSlot = {
  show: boolean;
  name: string;
  enterAnimation?: Parameters<typeof HTMLElement.prototype.animate>;
  leaveAnimation?: Parameters<typeof HTMLElement.prototype.animate>;
};

export type ScrollViewState = {
  width: number;
  height: number;
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
};

export const scrollViewProps = freeze({
  observeResize: PropBoolean(),
  scrollXPercentVarName: PropString(),
  scrollYPercentVarName: PropString(),
  intersectionAttr: PropString(),
  xThresholds: PropNumOrArr(),
  yThresholds: PropNumOrArr(),
  hideScrollBar: PropBoolean(),
  getSlots: PropFunction<(state: any) => ScrollViewSlot[] | ScrollViewSlot>(),
});

export const scrollViewEmits = freeze({});

export type ScrollViewSetupProps = ExtractPropTypes<typeof scrollViewProps> & CommonProps;
export type ScrollViewEvents = GetEventPropsFromEmits<typeof scrollViewEmits>;
export type ScrollViewProps = Partial<ScrollViewSetupProps> & ScrollViewEvents;
