import { defineSwitch, SwitchProps, iSwitch } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LSwitch = createComponent<SwitchProps, iSwitch>('switch', defineSwitch);
if (__DEV__) LSwitch.displayName = 'LSwitch';
