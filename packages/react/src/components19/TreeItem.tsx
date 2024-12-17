import { defineTreeItem, TreeItemProps, iTreeItem } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LTreeItem = createComponent<TreeItemProps, iTreeItem>('tree-item', defineTreeItem);
if (__DEV__) LTreeItem.displayName = 'LTreeItem';
