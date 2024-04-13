
import { dividerEmits, DividerProps, dividerProps, defineDivider, iDivider } from '@lun/components';
import createComponent from '../createComponent';

export const LDivider = createComponent<DividerProps, iDivider>('divider', defineDivider, dividerProps, dividerEmits);
if (__DEV__) LDivider.displayName = 'LDivider';
