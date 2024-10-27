
import { checkboxEmits, CheckboxProps, checkboxProps, defineCheckbox, iCheckbox } from '@lun-web/components';
import createComponent from '../createComponent';

export const LCheckbox = createComponent<CheckboxProps, iCheckbox>('checkbox', defineCheckbox, checkboxProps, checkboxEmits);
if (__DEV__) LCheckbox.displayName = 'LCheckbox';
