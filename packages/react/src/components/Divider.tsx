import { dividerEmits, dividerProps, defineDivider, DividerProps, iDivider } from '@lun-web/components';
import createComponent from '../createComponent';

export const LDivider = createComponent<DividerProps, iDivider>('divider', defineDivider, dividerProps, dividerEmits);
if (__DEV__) LDivider.displayName = 'LDivider';
