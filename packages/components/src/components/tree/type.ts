import { freeze, MaybeArray, MaybeSet } from '@lun/utils';
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
  PropObject,
  PropSet,
} from 'common';
import { ExtractPropTypes } from 'vue';

export const treeProps = freeze({
  ...themeProps,
  ...editStateProps,
  items: PropArray<(TreeItemSetupProps & { children?: TreeItemSetupProps[]; loadable?: boolean })[]>(),
  itemPropsMap: PropObject<Record<keyof TreeItemSetupProps | 'children' | 'key', string> & Record<string, string>>(),
  watchItemProps: PropBoolean(), // TODO value/disabled
  checked: PropSet(),
  selected: Prop<MaybeArray<any> | MaybeSet<any>>(),
  expanded: PropSet(),
  defaultExpandAll: PropBoolean(),
  selectable: PropString<'line' | 'label'>(),
  selectMode: PropString<'single' | 'multiple' | 'ctrl-multiple'>(),
  checkable: PropBoolean(),
  // TODO
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
