import { freeze } from '@lun-web/utils';
import { GetEventPropsFromEmits, themeProps, createTransitionProps, CommonProps, editStateProps, GetEventMapFromEmits } from 'common';
import { ExtractPropTypes } from 'vue';

export const skeletonProps = freeze({
  ...themeProps,
  ...editStateProps,
  ...createTransitionProps('load'),
});

export const skeletonEmits = freeze({});

export type SkeletonSetupProps = ExtractPropTypes<typeof skeletonProps> & CommonProps;
export type SkeletonEventProps = GetEventPropsFromEmits<typeof skeletonEmits>;
export type SkeletonEventMap = GetEventMapFromEmits<typeof skeletonEmits>;
export type SkeletonProps = Partial<SkeletonSetupProps> & SkeletonEventProps;
