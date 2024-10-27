
import { textareaEmits, TextareaProps, textareaProps, defineTextarea, iTextarea } from '@lun-web/components';
import createComponent from '../createComponent';

export const LTextarea = createComponent<TextareaProps, iTextarea>('textarea', defineTextarea, textareaProps, textareaEmits);
if (__DEV__) LTextarea.displayName = 'LTextarea';
