
import { selectOptionEmits, SelectOptionProps, selectOptionProps, defineSelectOption, iSelectOption } from '@lun/components';
import createComponent from '../createComponent';

export const LSelectOption = createComponent<SelectOptionProps, iSelectOption>('select-option', defineSelectOption, selectOptionProps, selectOptionEmits);
if (__DEV__) LSelectOption.displayName = 'LSelectOption';
