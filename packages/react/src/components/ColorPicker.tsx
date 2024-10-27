
import { colorPickerEmits, ColorPickerProps, colorPickerProps, defineColorPicker, iColorPicker } from '@lun-web/components';
import createComponent from '../createComponent';

export const LColorPicker = createComponent<ColorPickerProps, iColorPicker>('color-picker', defineColorPicker, colorPickerProps, colorPickerEmits);
if (__DEV__) LColorPicker.displayName = 'LColorPicker';
