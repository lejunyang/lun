import { spinEmits, spinProps, defineSpin, SpinProps, iSpin } from '@lun-web/components';
import createComponent from '../createComponent';

export const LSpin = createComponent<SpinProps, iSpin>('spin', defineSpin, spinProps, spinEmits);
if (__DEV__) LSpin.displayName = 'LSpin';
