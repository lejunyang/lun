import { defineButton, ButtonProps, iButton } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LButton = createComponent<ButtonProps, iButton>('button', defineButton);
if (__DEV__) LButton.displayName = 'LButton';
