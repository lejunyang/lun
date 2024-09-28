import { freeze } from '@lun/utils';
import {
  GetEventPropsFromEmits,
  PropString,
  themeProps,
  createTransitionProps,
  CommonProps,
  PropObjOrBool,
  Prop,
} from 'common';
import { ExtractPropTypes } from 'vue';

export const treeProps = freeze({
  ...themeProps,
});

export const treeEmits = freeze({
});

export type TreeSetupProps = ExtractPropTypes<typeof treeProps> & CommonProps;
export type TreeEvents = GetEventPropsFromEmits<typeof treeEmits>;
export type TreeProps = Partial<TreeSetupProps> & TreeEvents;


export const treeItemProps = freeze({
  ...themeProps,
  label: Prop()
});

export const treeItemEmits = freeze({});

export type TreeItemSetupProps = ExtractPropTypes<typeof treeItemProps> & CommonProps;
export type TreeItemEvents = GetEventPropsFromEmits<typeof treeItemEmits>;
export type TreeItemProps = Partial<TreeItemSetupProps> & TreeItemEvents;