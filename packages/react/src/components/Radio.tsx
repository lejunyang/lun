
import { radioEmits, RadioProps, radioProps, defineRadio, iRadio } from '@lun/components';
import createComponent from '../createComponent';

export const LRadio = createComponent<RadioProps, iRadio>('radio', defineRadio, radioProps, radioEmits);
if (__DEV__) LRadio.displayName = 'LRadio';
