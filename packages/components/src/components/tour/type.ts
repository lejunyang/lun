import { freeze, omit } from '@lun/utils';
import { GetEventPropsFromEmits, CommonProps, PropNumber, PropObject, PropArray } from 'common';
import { ExtractPropTypes } from 'vue';
import { MaybePromise, MaybeRefLikeOrGetter, VirtualElement } from '@lun/core';
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

export const tourEmits = freeze({
  ...dialogEmits,
  updateStep: (_: TourStep) => true,
});

export type TourSetupProps = ExtractPropTypes<typeof tourProps> & CommonProps;
export type TourEvents = GetEventPropsFromEmits<typeof tourEmits>;
export type TourProps = Partial<TourSetupProps> & TourEvents;
