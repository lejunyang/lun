import { radioEmits, radioProps, defineRadio, RadioProps, iRadio } from '@lun-web/components';
import createComponent from '../createComponent';

export const LRadio = createComponent<RadioProps, iRadio>('radio', defineRadio, radioProps, radioEmits);
if (__DEV__) LRadio.displayName = 'LRadio';
