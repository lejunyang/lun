import { defineForm, FormProps, iForm } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LForm = createComponent<FormProps, iForm>('form', defineForm);
if (__DEV__) LForm.displayName = 'LForm';
