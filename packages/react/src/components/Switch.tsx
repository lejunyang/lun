import { switchEmits, switchProps, defineSwitch, SwitchProps, iSwitch } from '@lun-web/components';
import createComponent from '../createComponent';

export const LSwitch = createComponent<SwitchProps, iSwitch>('switch', defineSwitch, switchProps, switchEmits);
if (__DEV__) LSwitch.displayName = 'LSwitch';
