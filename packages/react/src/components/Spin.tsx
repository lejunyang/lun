
import { spinEmits, SpinProps, spinProps, defineSpin, iSpin } from '@lun/components';
import createComponent from '../createComponent';

export const LSpin = createComponent<SpinProps, iSpin>('spin', defineSpin, spinProps, spinEmits);
if (__DEV__) LSpin.displayName = 'LSpin';
