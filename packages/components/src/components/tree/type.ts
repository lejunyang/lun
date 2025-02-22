import { freeze, MaybeArray, MaybeSet } from '@lun-web/utils';
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
  createEmits,
  GetEventMapFromEmits,
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
  selectable: PropString<'line' | 'label' | (string & {})>(),
  selectionMode: PropString<'single' | 'multiple' | 'ctrl-multiple' | (string & {})>(),
  checkable: PropBoolean(),
  // TODO
  checkStrategy: PropString<'tree' | 'separate' | (string & {})>(),
  indentSize: PropNumber(),
});

export const treeEmits = createEmits<{
  update: {
    checked: {
      value: unknown[];
      raw: Set<unknown>;
    };
    selected: {
      value: unknown;
      raw: unknown;
    };
    expanded: {
      value: unknown;
      raw: unknown;
    };
  };
  check: {
    value: unknown[];
    raw: Set<unknown>;
  };
  select: {
    value: unknown;
    raw: unknown;
  };
  expand: {
    value: unknown;
    raw: unknown;
  };
}>(['update', 'check', 'select', 'expand']);

export type TreeSetupProps = ExtractPropTypes<typeof treeProps> & CommonProps;
export type TreeEventProps = GetEventPropsFromEmits<typeof treeEmits>;
export type TreeEventMap = GetEventMapFromEmits<typeof treeEmits>;
export type TreeProps = Partial<TreeSetupProps> & TreeEventProps;

export const treeItemProps = freeze({
  ...themeProps,
  ...editStateProps,
  ...createTransitionProps('expand'),
  label: Prop(),
  value: Prop(),
  /** @internal it's for internal use, representing the column object, do not use it yourself! */
  _: PropObject<any>(),
});

export const treeItemEmits = freeze({});

export type TreeItemSetupProps = Omit<ExtractPropTypes<typeof treeItemProps>, '_'> & CommonProps;
export type TreeItemEventProps = GetEventPropsFromEmits<typeof treeItemEmits>;
export type TreeItemEventMap = GetEventMapFromEmits<typeof treeItemEmits>;
export type TreeItemProps = Partial<TreeItemSetupProps> & TreeItemEventProps;
