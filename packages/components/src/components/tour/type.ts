import { Constructor, freeze, omit } from '@lun/utils';
import { GetEventPropsFromEmits, CommonProps, PropNumOrArr, PropNumber, PropObject } from 'common';
import { ExtractPropTypes } from 'vue';
import { MaybePromise, MaybeRefLikeOrGetter } from '@lun/core';
import { dialogProps } from '../dialog';

export type TourStep = {
  title?: string;
  content?: string;
  target: MaybeRefLikeOrGetter<string | Element>;
  beforeEnter?: () => MaybePromise<boolean | void>;
};

export const tourProps = freeze({
  ...omit(dialogProps, ['noOkBtn', 'noCancelBtn', 'okBtnProps', 'okText', 'cancelBtnProps', 'cancelText', 'beforeOk']),
  steps: PropNumOrArr<string | number, Constructor<TourStep[]>[]>(),
  highlightPadding: PropNumber(),
  scrollOptions: PropObject<ScrollIntoViewOptions>(),
});

export const tourEmits = freeze({
  open: null,
  close: null,
});

export type TourSetupProps = ExtractPropTypes<typeof tourProps> & CommonProps;
export type TourEvents = GetEventPropsFromEmits<typeof tourEmits>;
export type TourProps = Partial<TourSetupProps> & TourEvents;
