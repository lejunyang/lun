import { Constructor, freeze } from '@lun/utils';
import { GetEventPropsFromEmits, PropBoolean, CommonProps, PropNumOrArr } from 'common';
import { ExtractPropTypes } from 'vue';
import { MaybeRefLikeOrGetter } from '@lun/core';
import { dialogProps } from '../dialog';

export type TourStep = {
  title?: string;
  content?: string;
  target: MaybeRefLikeOrGetter<string | Element>;
};

export const tourProps = freeze({
  ...dialogProps,
  steps: PropNumOrArr<string | number, Constructor<TourStep[]>[]>(),
});

export const tourEmits = freeze({
  open: null,
  close: null,
});

export type TourSetupProps = ExtractPropTypes<typeof tourProps> & CommonProps;
export type TourEvents = GetEventPropsFromEmits<typeof tourEmits>;
export type TourProps = Partial<TourSetupProps> & TourEvents;
