
import { progressEmits, ProgressProps, progressProps, defineProgress, iProgress } from '@lun-web/components';
import createComponent from '../createComponent';

export const LProgress = createComponent<ProgressProps, iProgress>('progress', defineProgress, progressProps, progressEmits);
if (__DEV__) LProgress.displayName = 'LProgress';
