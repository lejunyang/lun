import { datePickerEmits, datePickerProps, defineDatePicker, DatePickerProps, iDatePicker } from '@lun-web/components';
import createComponent from '../createComponent';

export const LDatePicker = createComponent<DatePickerProps, iDatePicker>('date-picker', defineDatePicker, datePickerProps, datePickerEmits);
if (__DEV__) LDatePicker.displayName = 'LDatePicker';
