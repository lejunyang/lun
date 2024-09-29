import { freeze } from '@lun/utils';
import { GetEventPropsFromEmits, themeProps, CommonProps, Prop, PropNumber, editStateProps, PropArray } from 'common';
import { ExtractPropTypes } from 'vue';

export const treeProps = freeze({
  ...themeProps,
  ...editStateProps,
  value: PropArray(),
  expanded: PropArray(),
  indentSize: PropNumber(),
});

export const treeEmits = freeze({
  update: (_: any[]) => true,
});

export type TreeSetupProps = ExtractPropTypes<typeof treeProps> & CommonProps;
export type TreeEvents = GetEventPropsFromEmits<typeof treeEmits>;
export type TreeProps = Partial<TreeSetupProps> & TreeEvents;

export const treeItemProps = freeze({
  ...themeProps,
  ...editStateProps,
  label: Prop(),
  value: Prop(),
});

export const treeItemEmits = freeze({});

export type TreeItemSetupProps = ExtractPropTypes<typeof treeItemProps> & CommonProps;
export type TreeItemEvents = GetEventPropsFromEmits<typeof treeItemEmits>;
export type TreeItemProps = Partial<TreeItemSetupProps> & TreeItemEvents;
