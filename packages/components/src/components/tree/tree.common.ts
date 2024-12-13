import { ComponentInternalInstance } from 'vue';
import { getVmValue, isVm, isVmDisabled } from 'utils';

export type Item = Record<string, unknown> | ComponentInternalInstance;

export const isDisabled = (item: Item) => (isVm(item) ? isVmDisabled(item) : item.disabled);
export const getValue = (item: Item) => (isVm(item) ? getVmValue(item) : item.value);
