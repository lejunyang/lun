
import { buttonEmits, ButtonProps, buttonProps, defineButton, iButton } from '@lun-web/components';
import createComponent from '../createComponent';

export const LButton = createComponent<ButtonProps, iButton>('button', defineButton, buttonProps, buttonEmits);
if (__DEV__) LButton.displayName = 'LButton';
