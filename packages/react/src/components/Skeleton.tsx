
import { skeletonEmits, SkeletonProps, skeletonProps, defineSkeleton, iSkeleton } from '@lun/components';
import createComponent from '../createComponent';

export const LSkeleton = createComponent<SkeletonProps, iSkeleton>('skeleton', defineSkeleton, skeletonProps, skeletonEmits);
if (__DEV__) LSkeleton.displayName = 'LSkeleton';
