import { defineTabItem, TabItemProps, iTabItem } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LTabItem = createComponent<TabItemProps, iTabItem>('tab-item', defineTabItem);
if (__DEV__) LTabItem.displayName = 'LTabItem';
