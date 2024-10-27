
import { tabItemEmits, TabItemProps, tabItemProps, defineTabItem, iTabItem } from '@lun/components';
import createComponent from '../createComponent';

export const LTabItem = createComponent<TabItemProps, iTabItem>('tab-item', defineTabItem, tabItemProps, tabItemEmits);
if (__DEV__) LTabItem.displayName = 'LTabItem';
