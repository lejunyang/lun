import { formEmits, formProps, defineForm, FormProps, iForm } from '@lun-web/components';
import createComponent from '../createComponent';

export const LForm = createComponent<FormProps, iForm>('form', defineForm, formProps, formEmits);
if (__DEV__) LForm.displayName = 'LForm';
