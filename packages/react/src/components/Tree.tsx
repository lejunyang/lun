
import { treeEmits, TreeProps, treeProps, defineTree, iTree } from '@lun/components';
import createComponent from '../createComponent';

export const LTree = createComponent<TreeProps, iTree>('tree', defineTree, treeProps, treeEmits);
if (__DEV__) LTree.displayName = 'LTree';
