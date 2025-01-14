import { inputEmits, inputProps, defineInput, InputProps, iInput } from '@lun-web/components';
import createComponent from '../createComponent';

export const LInput = createComponent<InputProps, iInput>('input', defineInput, inputProps, inputEmits);
if (__DEV__) LInput.displayName = 'LInput';
