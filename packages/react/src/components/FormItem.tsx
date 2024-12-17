import { formItemEmits, formItemProps, defineFormItem, FormItemProps, iFormItem } from '@lun-web/components';
import createComponent from '../createComponent';

export const LFormItem = createComponent<FormItemProps, iFormItem>('form-item', defineFormItem, formItemProps, formItemEmits);
if (__DEV__) LFormItem.displayName = 'LFormItem';
