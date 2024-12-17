import { filePickerEmits, filePickerProps, defineFilePicker, FilePickerProps, iFilePicker } from '@lun-web/components';
import createComponent from '../createComponent';

export const LFilePicker = createComponent<FilePickerProps, iFilePicker>('file-picker', defineFilePicker, filePickerProps, filePickerEmits);
if (__DEV__) LFilePicker.displayName = 'LFilePicker';
