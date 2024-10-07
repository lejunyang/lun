import { freeze } from '@lun/utils';
import {
  GetEventPropsFromEmits,
  themeProps,
  CommonProps,
  Prop,
  PropNumber,
  editStateProps,
  PropArray,
  PropBoolean,
  createTransitionProps,
  PropString,
} from 'common';
import { ExtractPropTypes } from 'vue';

export const treeProps = freeze({
  ...themeProps,
  ...editStateProps,
  checked: PropArray(),
  selected: PropArray(),
  expanded: PropArray(),
  defaultExpandAll: PropBoolean(),
  selectable: PropString<'line' | 'label'>(),
  selectMode: PropString<'single' | 'multiple' | 'ctrl-multiple'>(),
  checkable: PropBoolean(),
  checkStrategy: PropString<'tree' | 'separate'>(),
  indentSize: PropNumber(),
});

export const treeEmits = freeze({
  update: (_: { checked: any[]; selected: any[] | any; expanded: any[] }) => true,
  check: (_: any[]) => true,
  select: (_: any | any[]) => true,
  expand: (_: any[]) => true,
});

export type TreeSetupProps = ExtractPropTypes<typeof treeProps> & CommonProps;
export type TreeEvents = GetEventPropsFromEmits<typeof treeEmits>;
export type TreeProps = Partial<TreeSetupProps> & TreeEvents;

export const treeItemProps = freeze({
  ...themeProps,
  ...editStateProps,
  ...createTransitionProps('expand'),
  label: Prop(),
  value: Prop(),
});

export const treeItemEmits = freeze({});

export type TreeItemSetupProps = ExtractPropTypes<typeof treeItemProps> & CommonProps;
export type TreeItemEvents = GetEventPropsFromEmits<typeof treeItemEmits>;
export type TreeItemProps = Partial<TreeItemSetupProps> & TreeItemEvents;
