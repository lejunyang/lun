import { ToAllMaybeRefLike, unrefOrGet, useCheckboxMethods } from '@lun/core';
import { createCount, getChildren, getParent, getValue, isLeafChild, Item } from './tree.common';
import { arrayFrom, differenceOfSets } from '@lun/utils';

export function useTreeCheckMethods(
  options: ToAllMaybeRefLike<
    {
      value: Set<any>;
      allValues: Set<any>;
      childrenCheckedMap: WeakMap<Item, number>;
    },
    true
  > & {
    childrenInfo: {
      childrenValuesSet: Set<any>;
      noneLeafValuesSet: Set<any>;
    };
    onChange: (value: any | any[]) => void;
    valueToChild: (value: any) => Item | undefined;
  },
) {
  const { value, onChange, valueToChild, childrenCheckedMap, childrenInfo } = options;
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
    const currentVm = valueToChild(value),
      checked = methods.isChecked(value);
    if (!currentVm || (isUnCheck ? !checked : checked)) return;
    const isLeaf = isLeafChild(currentVm),
      parent = getParent(currentVm);
    // check/uncheck self
    if (isUnCheck) currentChecked.delete(value);
    else {
      // it's from children's update, only check parent if all children are checked
      if (updateParent === -1) {
        const checkedChildren = unrefOrGet(childrenCheckedMap).get(currentVm);
        if (checkedChildren! !== getChildren(currentVm).length) return;
      }
      currentChecked.add(value);
    }
    if (!isLeaf && updateParent !== -1) {
      getChildren(currentVm).forEach((c) => internalUpdate(getValue(c), currentChecked, 0, isUnCheck));
    }
    if (updateParent && parent) {
      isUnCheck ? countDown(parent) : countUp(parent);
      internalUpdate(getValue(parent), currentChecked, -1, isUnCheck);
    }
  };
  const internalBatchUpdate = (values: any[], isUnCheck?: number) => {
    const old = unrefOrGet(value),
      newSet = new Set(old);
    values.forEach((value) => internalUpdate(value, newSet, 1, isUnCheck));
    if (old.size !== newSet.size) onChange(arrayFrom(newSet));
  };
  const check = (...values: any[]) => {
      internalBatchUpdate(values);
    },
    uncheck = (...values: any[]) => {
      internalBatchUpdate(values, 1);
    };

  Object.assign(methods, {
    check,
    uncheck,
    toggle(value: any) {
      if (methods.isChecked(value)) uncheck(value);
      else check(value);
    },
    reverse() {
      const leafSet = differenceOfSets(childrenInfo.childrenValuesSet, childrenInfo.noneLeafValuesSet);
      onChange(arrayFrom(differenceOfSets(leafSet, unrefOrGet(value))));
    },
  });
  return {
    ...methods,
    isIntermediate(value: any) {
      const currentVm = valueToChild(value);
      if (!currentVm) return false;
      const children = getChildren(currentVm),
        checkedChildren = unrefOrGet(childrenCheckedMap).get(currentVm)!;
      return 0 < checkedChildren && checkedChildren < children.length;
    },
  };
}
