import { freeze } from '@lun/utils';
import { GetEventPropsFromEmits, themeProps, createTransitionProps, CommonProps, editStateProps } from 'common';
import { ExtractPropTypes } from 'vue';

export const skeletonProps = freeze({
  ...themeProps,
  ...editStateProps,
  ...createTransitionProps('load'),
});

export const skeletonEmits = freeze({});

export type SkeletonSetupProps = ExtractPropTypes<typeof skeletonProps> & CommonProps;
export type SkeletonEvents = GetEventPropsFromEmits<typeof skeletonEmits>;
export type SkeletonProps = Partial<SkeletonSetupProps> & SkeletonEvents;
