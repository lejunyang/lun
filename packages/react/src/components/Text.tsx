
import { textEmits, TextProps, textProps, defineText, iText } from '@lun-web/components';
import createComponent from '../createComponent';

export const LText = createComponent<TextProps, iText>('text', defineText, textProps, textEmits);
if (__DEV__) LText.displayName = 'LText';