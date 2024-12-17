import { defineText, TextProps, iText } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LText = createComponent<TextProps, iText>('text', defineText);
if (__DEV__) LText.displayName = 'LText';
