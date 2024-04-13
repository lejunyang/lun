
import { selectEmits, SelectProps, selectProps, defineSelect, iSelect } from '@lun/components';
import createComponent from '../createComponent';

export const LSelect = createComponent<SelectProps, iSelect>('select', defineSelect, selectProps, selectEmits);
if (__DEV__) LSelect.displayName = 'LSelect';
