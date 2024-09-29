import { freeze } from '@lun/utils';
import { GetEventPropsFromEmits, themeProps, CommonProps, Prop, valueProp, PropNumber, editStateProps } from 'common';
import { ExtractPropTypes } from 'vue';

export const treeProps = freeze({
  ...themeProps,
  ...editStateProps,
  indentSize: PropNumber(),
});

export const treeEmits = freeze({});

export type TreeSetupProps = ExtractPropTypes<typeof treeProps> & CommonProps;
export type TreeEvents = GetEventPropsFromEmits<typeof treeEmits>;
export type TreeProps = Partial<TreeSetupProps> & TreeEvents;

export const treeItemProps = freeze({
  ...themeProps,
  ...editStateProps,
  label: Prop(),
  value: valueProp,
});

export const treeItemEmits = freeze({});

export type TreeItemSetupProps = ExtractPropTypes<typeof treeItemProps> & CommonProps;
export type TreeItemEvents = GetEventPropsFromEmits<typeof treeItemEmits>;
export type TreeItemProps = Partial<TreeItemSetupProps> & TreeItemEvents;
