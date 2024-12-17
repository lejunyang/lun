import { selectOptionEmits, selectOptionProps, defineSelectOption, SelectOptionProps, iSelectOption } from '@lun-web/components';
import createComponent from '../createComponent';

export const LSelectOption = createComponent<SelectOptionProps, iSelectOption>('select-option', defineSelectOption, selectOptionProps, selectOptionEmits);
if (__DEV__) LSelectOption.displayName = 'LSelectOption';
