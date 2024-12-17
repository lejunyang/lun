import { skeletonEmits, skeletonProps, defineSkeleton, SkeletonProps, iSkeleton } from '@lun-web/components';
import createComponent from '../createComponent';

export const LSkeleton = createComponent<SkeletonProps, iSkeleton>('skeleton', defineSkeleton, skeletonProps, skeletonEmits);
if (__DEV__) LSkeleton.displayName = 'LSkeleton';
