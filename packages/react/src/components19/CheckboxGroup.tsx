import { defineCheckboxGroup, CheckboxGroupProps, iCheckboxGroup } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LCheckboxGroup = createComponent<CheckboxGroupProps, iCheckboxGroup>('checkbox-group', defineCheckboxGroup);
if (__DEV__) LCheckboxGroup.displayName = 'LCheckboxGroup';
