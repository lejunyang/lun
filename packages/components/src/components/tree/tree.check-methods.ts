import { ToAllMaybeRefLike, unrefOrGet, useCheckboxMethods } from '@lun/core';
import { ComponentInternalInstance } from 'vue';
import { TreeParentContext } from './collector';
import { createCount, getValue, isLeafChild } from './tree.common';
import { arrayFrom } from '@lun/utils';

export function useTreeCheckMethods(
  options: ToAllMaybeRefLike<
    {
      valueSet: Set<any>;
      allValues: any[] | Set<any>;
      childrenCheckedMap: WeakMap<ComponentInternalInstance, number>;
    },
    true
  > & {
    onChange: (value: any | any[]) => void;
    valueToChild: (value: any) => ComponentInternalInstance | undefined;
    getContext: () => TreeParentContext;
  },
) {
  const { valueSet, onChange, valueToChild, getContext, childrenCheckedMap } = options;
  const countUp = createCount(childrenCheckedMap, 1),
    countDown = createCount(childrenCheckedMap, -1);
  const methods = useCheckboxMethods(options);

  const internalUpdate = (
    value: any,
    currentChecked: Set<any>,
    /**
     * updateParent = 0: do not update parent, used when iterating children;
     * updateParent = 1: should update parent
     * updateParent = -1: should update parent and skip children's update, it's triggered by child's update;
     */
    updateParent = 1,
    isUnCheck?: number,
  ) => {
    const { getVmTreeChildren, getVmTreeParent } = getContext();
    const currentVm = valueToChild(value),
      checked = methods.isChecked(value);
    if (!currentVm || !isUnCheck! !== checked) return;
    const isLeaf = isLeafChild(currentVm),
      parent = getVmTreeParent(currentVm);
    // check/uncheck self
    if (isUnCheck) currentChecked.delete(value);
    else {
      // it's from children's update, only check parent if all children are checked
      if (updateParent === -1) {
        const checkedChildren = unrefOrGet(childrenCheckedMap).get(currentVm);
        if (checkedChildren! + 1 !== getVmTreeChildren(currentVm).length) return;
      }
      currentChecked.add(value);
    }
    if (!isLeaf && updateParent !== -1) {
      getVmTreeChildren(currentVm).forEach((c) => internalUpdate(getValue(c), currentChecked, 0, isUnCheck));
    }
    if (updateParent && parent) {
      isUnCheck ? countDown(parent) : countUp(parent);
      internalUpdate(getValue(parent), currentChecked, -1, isUnCheck);
    }
  };
  const internalBatchUpdate = (values: any[], isUnCheck?: number) => {
    const old = unrefOrGet(valueSet),
      newSet = new Set(old);
    values.forEach((value) => internalUpdate(value, newSet, 1, isUnCheck));
    if (old.size !== newSet.size) onChange(arrayFrom(newSet));
  };
  Object.assign(methods, {
    check(...values: any[]) {
      internalBatchUpdate(values);
    },
    uncheck(...values: any[]) {
      internalBatchUpdate(values, 1);
    },
    toggle(value: any) {
      if (methods.isChecked(value)) methods.uncheck(value);
      else methods.check(value);
    },
  });
  return methods;
}
