
import { checkboxGroupEmits, CheckboxGroupProps, checkboxGroupProps, defineCheckboxGroup, iCheckboxGroup } from '@lun/components';
import createComponent from '../createComponent';

export const LCheckboxGroup = createComponent<CheckboxGroupProps, iCheckboxGroup>('checkbox-group', defineCheckboxGroup, checkboxGroupProps, checkboxGroupEmits);
if (__DEV__) LCheckboxGroup.displayName = 'LCheckboxGroup';
