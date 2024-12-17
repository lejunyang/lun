import { defineColorPicker, ColorPickerProps, iColorPicker } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LColorPicker = createComponent<ColorPickerProps, iColorPicker>('color-picker', defineColorPicker);
if (__DEV__) LColorPicker.displayName = 'LColorPicker';
