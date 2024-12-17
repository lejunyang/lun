import { selectEmits, selectProps, defineSelect, SelectProps, iSelect } from '@lun-web/components';
import createComponent from '../createComponent';

export const LSelect = createComponent<SelectProps, iSelect>('select', defineSelect, selectProps, selectEmits);
if (__DEV__) LSelect.displayName = 'LSelect';
