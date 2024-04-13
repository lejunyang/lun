
import { formItemEmits, FormItemProps, formItemProps, defineFormItem, iFormItem } from '@lun/components';
import createComponent from '../createComponent';

export const LFormItem = createComponent<FormItemProps, iFormItem>('form-item', defineFormItem, formItemProps, formItemEmits);
if (__DEV__) LFormItem.displayName = 'LFormItem';
