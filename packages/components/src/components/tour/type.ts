import { freeze, omit } from '@lun-web/utils';
import {
  GetEventPropsFromEmits,
  CommonProps,
  PropNumber,
  PropObject,
  PropArray,
  createEmits,
  OpenCloseEmits,
  GetEventMapFromEmits,
} from 'common';
import { ExtractPropTypes } from 'vue';
import { MaybePromise, MaybeRefLikeOrGetter, VirtualElement } from '@lun-web/core';
import { dialogEmits, dialogProps } from '../dialog';
import { popoverFloatingUIProps } from '../popover/type';

export type TourStep = {
  title?: string;
  content?: string;
  target?: MaybeRefLikeOrGetter<string | Element | VirtualElement>;
  beforeEnter?: () => MaybePromise<boolean | void>;
  scrollOptions?: ScrollIntoViewOptions;
  // TODO skip func
};

export const tourProps = freeze({
  ...omit(dialogProps, ['noOkBtn', 'noCancelBtn', 'okBtnProps', 'okText', 'cancelBtnProps', 'cancelText', 'beforeOk']),
  ...popoverFloatingUIProps,
  /**
   * @locale.zh-CN 引导步骤数组，每一项描述一个引导步骤的标题、内容、目标元素等信息
   * @locale.en Array of tour steps; each item describes a step's title, content and target element
   */
  steps: PropArray<TourStep[]>(),
  /**
   * @locale.zh-CN 目标元素高亮区域的额外内边距，单位为像素
   * @locale.en Extra padding in pixels around the highlighted target element
   * @default 2
   */
  highlightPadding: PropNumber(),
  /**
   * @locale.zh-CN 滚动目标元素到可视区域时使用的默认选项，可被单个 step 的 scrollOptions 覆盖
   * @locale.en Default options used when scrolling the target element into view; can be overridden per step
   */
  scrollOptions: PropObject<ScrollIntoViewOptions>(),
});

export const tourEmits = createEmits<
  {
    update: boolean;
    updateStep: TourStep;
  } & OpenCloseEmits
>([...(dialogEmits as unknown as string[]), 'updateStep']);

export type TourSetupProps = ExtractPropTypes<typeof tourProps> & CommonProps;
export type TourEventProps = GetEventPropsFromEmits<typeof tourEmits>;
export type TourEventMap = GetEventMapFromEmits<typeof tourEmits>;
export type TourProps = Partial<TourSetupProps> & TourEventProps;
