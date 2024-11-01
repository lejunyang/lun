import { ToAllMaybeRefLike, unrefOrGet, useCheckboxMethods, watchOnMounted } from '@lun-web/core';
import { at, differenceOfSets } from '@lun-web/utils';
import { ComputedRef, ref, watch } from 'vue';
import { createCount, getLevel, getValue, isLeafChild, isDisabled, Item, getChildren, getParent } from './tree.common';

export function useTreeCheckMethods(
  options: ToAllMaybeRefLike<
    {
      allValues: Set<any>;
    },
    true
  > & {
    current: ComputedRef<Set<any>>;
    childrenInfo: {
      items: Item[];
      childrenValuesSet: Set<any>;
      noneLeafValuesSet: Set<any>;
    };
    onChange: (param: { value: unknown[]; raw: Set<unknown> }) => void;
    valueToChild: (value: any) => Item | undefined;
  },
) {
  const correctedCheckedSet = ref(new Set<any>()),
    itemDirectCheckedChildrenCountMap = ref(new WeakMap<Item, number>()),
    // TODO add itemNestedCheckedChildrenCountMap for intermediate
    itemDisabledChildrenCountMap = ref(new WeakMap<Item, number>());
  const { current, onChange, valueToChild, childrenInfo } = options;
  const countUp = createCount(itemDirectCheckedChildrenCountMap, 1),
    countDown = createCount(itemDirectCheckedChildrenCountMap, -1);
  const methods = useCheckboxMethods(options);

  // TODO watch disabled update
  const correctChecked = (items: Item[]) => {
    correctedCheckedSet.value.clear();
    const checkedChildrenCountMap = new WeakMap<Item, number>(),
      disabledChildrenCountMap = new WeakMap<Item, number>();

    const countUp = createCount(checkedChildrenCountMap, 1),
      disableCountUp = createCount(disabledChildrenCountMap, 1);

    const checked = current.value;
    let lastNoneLeafLevel: number | undefined,
      parentCheckedLevel: number | undefined,
      toBeCheckedVmStack: Item[] = [];

    const traverse = (stopLevel: number) => {
      if (!toBeCheckedVmStack.length) return;
      const topVm = at(toBeCheckedVmStack, -1)!;
      if (getLevel(topVm) < stopLevel) return;
      toBeCheckedVmStack.pop();
      const checkedCount = checkedChildrenCountMap.get(topVm),
        children = getChildren(topVm),
        parent = getParent(topVm);
      if (checkedCount === children.length - (disabledChildrenCountMap.get(topVm) || 0)) {
        // all children(except disabled) are checked
        correctedCheckedSet.value.add(getValue(topVm));
        parent && countUp(parent);
        traverse(stopLevel);
      }
    };

    items.forEach((child) => {
      const level = getLevel(child),
        isLeaf = isLeafChild(child),
        parent = getParent(child),
        disabled = isDisabled(child),
        childValue = getValue(child),
        isChecked = checked.has(childValue);

      if (parent && disabled) disableCountUp(parent);

      if (isChecked || (parentCheckedLevel! < level && !disabled)) correctedCheckedSet.value.add(childValue);
      if (isChecked && !isLeaf && parentCheckedLevel === undefined) parentCheckedLevel = level;

      if (level === lastNoneLeafLevel) traverse(level);
      if (level >= lastNoneLeafLevel! || !level) {
        if (!isLeaf) toBeCheckedVmStack.push(child);
        else if (isChecked) countUp(parent);
      } else parentCheckedLevel = undefined;

      if (!isLeaf) lastNoneLeafLevel = level;
    });

    traverse(0);

    itemDirectCheckedChildrenCountMap.value = checkedChildrenCountMap;
    itemDisabledChildrenCountMap.value = disabledChildrenCountMap;
  };
  watchOnMounted(() => childrenInfo.items, correctChecked);
  watch(current, (currentChecked) => {
    if (currentChecked !== correctedCheckedSet.value) {
      correctChecked(childrenInfo.items);
    }
  });

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
        const checkedChildren = unrefOrGet(itemDirectCheckedChildrenCountMap).get(currentVm);
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
    const result = correctedCheckedSet.value,
      oldSize = result.size;
    values.forEach((value) => internalUpdate(value, result, 1, isUnCheck));
    if (oldSize !== result.size) {
      onChange(methods._(result));
    }
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
      onChange(methods._((correctedCheckedSet.value = differenceOfSets(leafSet, correctedCheckedSet.value))));
    },
  });
  return {
    ...methods,
    isIntermediate(value: any) {
      const currentVm = valueToChild(value);
      if (!currentVm) return false;
      const children = getChildren(currentVm),
        checkedChildren = unrefOrGet(itemDirectCheckedChildrenCountMap).get(currentVm)!;
      return 0 < checkedChildren && checkedChildren < children.length;
    },
  };
}
