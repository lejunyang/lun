import { defineInput, InputProps, iInput } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LInput = createComponent<InputProps, iInput>('input', defineInput);
if (__DEV__) LInput.displayName = 'LInput';
