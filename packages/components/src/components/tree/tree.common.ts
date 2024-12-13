import { MaybeRefLikeOrGetter, unrefOrGet } from '@lun-web/core';
import { ComponentInternalInstance } from 'vue';
import { getVmValue, isVm, isVmDisabled } from 'utils';

export const createCount = (map: MaybeRefLikeOrGetter<WeakMap<any, number>, true>, diff: number) => (item?: any) =>
  item && unrefOrGet(map).set(item, (unrefOrGet(map).get(item) || 0) + diff);

export type Item = Record<string, unknown> | ComponentInternalInstance;

export const isDisabled = (item: Item) => (isVm(item) ? isVmDisabled(item) : item.disabled);
export const getValue = (item: Item) => (isVm(item) ? getVmValue(item) : item.value);
