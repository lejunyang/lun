import { defineSelect, SelectProps, iSelect } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LSelect = createComponent<SelectProps, iSelect>('select', defineSelect);
if (__DEV__) LSelect.displayName = 'LSelect';
