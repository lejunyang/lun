import { defineFilePicker, FilePickerProps, iFilePicker } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LFilePicker = createComponent<FilePickerProps, iFilePicker>('file-picker', defineFilePicker);
if (__DEV__) LFilePicker.displayName = 'LFilePicker';
