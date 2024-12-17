import { defineSelectOption, SelectOptionProps, iSelectOption } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LSelectOption = createComponent<SelectOptionProps, iSelectOption>('select-option', defineSelectOption);
if (__DEV__) LSelectOption.displayName = 'LSelectOption';
