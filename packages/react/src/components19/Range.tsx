import { defineRange, RangeProps, iRange } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LRange = createComponent<RangeProps, iRange>('range', defineRange);
if (__DEV__) LRange.displayName = 'LRange';
