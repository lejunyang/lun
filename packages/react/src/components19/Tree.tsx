import { defineTree, TreeProps, iTree } from '@lun-web/components';
import createComponent from '../createComponent19';

export const LTree = createComponent<TreeProps, iTree>('tree', defineTree);
if (__DEV__) LTree.displayName = 'LTree';
