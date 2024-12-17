import { checkboxGroupEmits, checkboxGroupProps, defineCheckboxGroup, CheckboxGroupProps, iCheckboxGroup } from '@lun-web/components';
import createComponent from '../createComponent';

export const LCheckboxGroup = createComponent<CheckboxGroupProps, iCheckboxGroup>('checkbox-group', defineCheckboxGroup, checkboxGroupProps, checkboxGroupEmits);
if (__DEV__) LCheckboxGroup.displayName = 'LCheckboxGroup';
