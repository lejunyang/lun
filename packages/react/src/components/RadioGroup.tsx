import { radioGroupEmits, radioGroupProps, defineRadioGroup, RadioGroupProps, iRadioGroup } from '@lun-web/components';
import createComponent from '../createComponent';

export const LRadioGroup = createComponent<RadioGroupProps, iRadioGroup>('radio-group', defineRadioGroup, radioGroupProps, radioGroupEmits);
if (__DEV__) LRadioGroup.displayName = 'LRadioGroup';
