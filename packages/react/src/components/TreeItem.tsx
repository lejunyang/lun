import { treeItemEmits, treeItemProps, defineTreeItem, TreeItemProps, iTreeItem } from '@lun-web/components';
import createComponent from '../createComponent';

export const LTreeItem = createComponent<TreeItemProps, iTreeItem>('tree-item', defineTreeItem, treeItemProps, treeItemEmits);
if (__DEV__) LTreeItem.displayName = 'LTreeItem';
