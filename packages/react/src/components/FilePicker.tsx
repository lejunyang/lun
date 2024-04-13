
import { filePickerEmits, FilePickerProps, filePickerProps, defineFilePicker, iFilePicker } from '@lun/components';
import createComponent from '../createComponent';

export const LFilePicker = createComponent<FilePickerProps, iFilePicker>('file-picker', defineFilePicker, filePickerProps, filePickerEmits);
if (__DEV__) LFilePicker.displayName = 'LFilePicker';
