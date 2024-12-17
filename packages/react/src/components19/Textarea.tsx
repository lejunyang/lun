import { defineTextarea, TextareaProps, iTextarea } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LTextarea = createComponent<TextareaProps, iTextarea>('textarea', defineTextarea);
if (__DEV__) LTextarea.displayName = 'LTextarea';
