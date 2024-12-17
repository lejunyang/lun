import { defineSkeleton, SkeletonProps, iSkeleton } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LSkeleton = createComponent<SkeletonProps, iSkeleton>('skeleton', defineSkeleton);
if (__DEV__) LSkeleton.displayName = 'LSkeleton';
