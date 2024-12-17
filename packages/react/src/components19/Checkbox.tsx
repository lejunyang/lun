import { defineCheckbox, CheckboxProps, iCheckbox } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LCheckbox = createComponent<CheckboxProps, iCheckbox>('checkbox', defineCheckbox);
if (__DEV__) LCheckbox.displayName = 'LCheckbox';
