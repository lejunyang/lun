import { defineRadioGroup, RadioGroupProps, iRadioGroup } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LRadioGroup = createComponent<RadioGroupProps, iRadioGroup>('radio-group', defineRadioGroup);
if (__DEV__) LRadioGroup.displayName = 'LRadioGroup';
