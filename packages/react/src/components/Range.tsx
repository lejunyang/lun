
import { rangeEmits, RangeProps, rangeProps, defineRange, iRange } from '@lun/components';
import createComponent from '../createComponent';

export const LRange = createComponent<RangeProps, iRange>('range', defineRange, rangeProps, rangeEmits);
if (__DEV__) LRange.displayName = 'LRange';
