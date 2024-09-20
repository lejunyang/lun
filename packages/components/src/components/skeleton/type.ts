import { freeze } from '@lun/utils';
import { GetEventPropsFromEmits, themeProps, createTransitionProps, CommonProps, PropBoolean } from 'common';
import { ExtractPropTypes } from 'vue';

export const skeletonProps = freeze({
  ...themeProps,
  ...createTransitionProps('loaded'),
  animated: PropBoolean(),
  loaded: PropBoolean(),
});

export const skeletonEmits = freeze({});

export type SkeletonSetupProps = ExtractPropTypes<typeof skeletonProps> & CommonProps;
export type SkeletonEvents = GetEventPropsFromEmits<typeof skeletonEmits>;
export type SkeletonProps = Partial<SkeletonSetupProps> & SkeletonEvents;
