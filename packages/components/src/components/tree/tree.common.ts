import { MaybeRefLikeOrGetter, unrefOrGet } from '@lun/core';
import { ComponentInternalInstance } from 'vue';
const createExpose = (expose: string) => (vm: ComponentInternalInstance) => vm.exposed?.[expose];
export const getLevel = createExpose('level');
export const isLeafChild = createExpose('isLeaf');
export const isVmDisabled = createExpose('disabled');
export const getValue = (vm: ComponentInternalInstance) => vm.props.value;

export const createCount =
  (map: MaybeRefLikeOrGetter<WeakMap<ComponentInternalInstance, number>, true>, diff: number) =>
  (vm?: ComponentInternalInstance) =>
    vm && unrefOrGet(map).set(vm, (unrefOrGet(map).get(vm) || 0) + diff);
