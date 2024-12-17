import { defineProgress, ProgressProps, iProgress } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LProgress = createComponent<ProgressProps, iProgress>('progress', defineProgress);
if (__DEV__) LProgress.displayName = 'LProgress';
