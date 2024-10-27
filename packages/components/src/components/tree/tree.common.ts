import { getVmTreeDirectChildren, getVmTreeParent, MaybeRefLikeOrGetter, unrefOrGet } from '@lun-web/core';
import { ComponentInternalInstance } from 'vue';
import { InternalTreeItem } from './tree.items';
import { getVmLevel, getVmValue, isVm, isVmDisabled, isVmLeafChild } from 'utils';

export const createCount = (map: MaybeRefLikeOrGetter<WeakMap<any, number>, true>, diff: number) => (item?: any) =>
  item && unrefOrGet(map).set(item, (unrefOrGet(map).get(item) || 0) + diff);

export type Item = InternalTreeItem | ComponentInternalInstance;

export const getLevel = (item: Item) => (isVm(item) ? getVmLevel(item) : item._.level);
export const isLeafChild = (item: Item) => (isVm(item) ? isVmLeafChild(item) : item._.isLeaf);
export const isDisabled = (item: Item) => (isVm(item) ? isVmDisabled(item) : item.disabled);
export const getValue = (item: Item) => (isVm(item) ? getVmValue(item) : item.value);

export const getParent = (item: Item) => (isVm(item) ? getVmTreeParent(item) : item._.parent);
export const getChildren = (item: Item) => (isVm(item) ? getVmTreeDirectChildren(item) : item._.children);
