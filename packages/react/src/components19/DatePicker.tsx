import { defineDatePicker, DatePickerProps, iDatePicker } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LDatePicker = createComponent<DatePickerProps, iDatePicker>('date-picker', defineDatePicker);
if (__DEV__) LDatePicker.displayName = 'LDatePicker';
