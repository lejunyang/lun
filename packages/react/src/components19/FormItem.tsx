import { defineFormItem, FormItemProps, iFormItem } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LFormItem = createComponent<FormItemProps, iFormItem>('form-item', defineFormItem);
if (__DEV__) LFormItem.displayName = 'LFormItem';
