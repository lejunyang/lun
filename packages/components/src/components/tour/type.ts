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
  steps: PropArray<TourStep[]>(),
  highlightPadding: PropNumber(),
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
