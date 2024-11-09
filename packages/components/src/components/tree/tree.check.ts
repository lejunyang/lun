import { ToAllMaybeRefLike, unrefOrGet, useCheckboxMethods, watchOnMounted } from '@lun-web/core';
import { at } from '@lun-web/utils';
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
    itemDisabledChildrenCountMap = ref(new WeakMap<Item, number>()),
    intermediateSet = ref(new WeakSet<Item>());
  const { current, onChange, valueToChild, childrenInfo } = options;
  const countUp = createCount(itemDirectCheckedChildrenCountMap, 1),
    countDown = createCount(itemDirectCheckedChildrenCountMap, -1);
  const methods = useCheckboxMethods(options);

  const getChildrenCount = (item: Item) => {
    const children = getChildren(item);
    return children.length - (itemDisabledChildrenCountMap.value.get(item) || 0);
  };

  // TODO watch disabled update
  const correctChecked = (items: Item[]) => {
    correctedCheckedSet.value.clear();
    intermediateSet.value = new WeakSet<Item>();
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
        parent = getParent(topVm),
        validChildrenCount = getChildrenCount(topVm);
      if (checkedCount === validChildrenCount) {
        // all children(except disabled) are checked
        correctedCheckedSet.value.add(getValue(topVm));
        intermediateSet.value.delete(topVm);
        parent && countUp(parent);
        traverse(stopLevel);
      } else if (checkedCount! > 0) {
        intermediateSet.value.add(topVm);
        // if item itself is intermediate, its all parents must also be intermediate. update that when stopLevel is 0
        if (!stopLevel) toBeCheckedVmStack.forEach((vm) => intermediateSet.value.add(vm));
      } else intermediateSet.value.delete(topVm);
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
  watchOnMounted(() => childrenInfo.items, correctChecked, { immediate: true });
  watch(current, (currentChecked) => {
    if (currentChecked !== correctedCheckedSet.value) {
      correctChecked(childrenInfo.items); // TODO items props with initial checked, see if intermediate is correct
    }
  });

  const updateParentIntermediate = (item: Item, isCheck: number) => {
    const parent = getParent(item);
    if (!parent) return;
    const parentCheckedCount = unrefOrGet(itemDirectCheckedChildrenCountMap).get(parent),
      childrenCount = getChildrenCount(parent),
      isIntermediate = intermediateSet.value.has(parent);
    if (
      !isIntermediate &&
      (
        // if isCheck is true, normally we should update all parents to intermediate, unless all of its children are checked
        (isCheck && parentCheckedCount !== childrenCount) ||
        // this is for isCheck=false
        (parentCheckedCount && parentCheckedCount < childrenCount))
    ) {
      // don't need to check `isCheck`, as both check and uncheck can lead to intermediate state
      intermediateSet.value.add(parent);
      return updateParentIntermediate(parent, 1);
    }
    if (
      !isCheck &&
      isIntermediate &&
      // if parent still has checked children, it is still intermediate
      !parentCheckedCount &&
      // check other children that are not checked but may be intermediate
      getChildren(parent).every((c) => !intermediateSet.value.has(c) || isDisabled(c))
    ) {
      intermediateSet.value.delete(parent);
      updateParentIntermediate(parent, 0);
    }
  };

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
      // checked = methods.isChecked(value); // do not use isChecked method, use currentChecked directly (for reverse method)
      checked = currentChecked.has(value);
    if (!currentVm || (isUnCheck ? !checked : checked)) return;
    const isLeaf = isLeafChild(currentVm),
      parent = getParent(currentVm);
    let shouldUpdateParentCheck: number;
    // check/uncheck self
    if (isUnCheck) {
      shouldUpdateParentCheck = 1;
      currentChecked.delete(value);
    } else {
      // updateParent === -1: it's from children's update, then need to check if all its children are checked and then check itself
      if (
        updateParent !== -1 ||
        unrefOrGet(itemDirectCheckedChildrenCountMap).get(currentVm) === getChildrenCount(currentVm)
      ) {
        shouldUpdateParentCheck = 1;
        currentChecked.add(value);
      }
    }
    intermediateSet.value.delete(currentVm);
    if (!isLeaf && updateParent !== -1) {
      unrefOrGet(itemDirectCheckedChildrenCountMap).set(currentVm, isUnCheck ? 0 : getChildrenCount(currentVm));
      getChildren(currentVm).forEach((c) => internalUpdate(getValue(c), currentChecked, 0, isUnCheck));
    }
    if (updateParent && parent) {
      if (shouldUpdateParentCheck!) {
        isUnCheck ? countDown(parent) : countUp(parent);
        internalUpdate(getValue(parent), currentChecked, -1, isUnCheck);
      }
      isUnCheck ? updateParentIntermediate(currentVm, 0) : updateParentIntermediate(currentVm, 1);
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

  const internalCheckAll = () => {
    const checkedChildrenCount = new WeakMap();
    childrenInfo.noneLeafValuesSet.forEach((value) => {
      const item = valueToChild(value);
      if (item) checkedChildrenCount.set(item, getChildrenCount(item));
    });
    itemDirectCheckedChildrenCountMap.value = checkedChildrenCount;
  };

  Object.assign(methods, {
    checkAll() {
      intermediateSet.value = new WeakSet<Item>();
      internalCheckAll();
      onChange(methods._((correctedCheckedSet.value = childrenInfo.childrenValuesSet)));
    },
    uncheckAll() {
      intermediateSet.value = new WeakSet<Item>();
      itemDirectCheckedChildrenCountMap.value = new WeakMap();
      onChange(methods._((correctedCheckedSet.value = new Set())));
    },
    check,
    uncheck,
    toggle(value: any) {
      if (methods.isChecked(value)) uncheck(value);
      else check(value);
    },
    reverse() {
      // const leafSet = differenceOfSets(childrenInfo.childrenValuesSet, childrenInfo.noneLeafValuesSet);
      // onChange(methods._((correctedCheckedSet.value = differenceOfSets(leafSet, correctedCheckedSet.value))));
      // previous was using differenceOfSets, but we can only get leaf values from that
      const result = new Set(childrenInfo.childrenValuesSet);
      internalCheckAll();
      correctedCheckedSet.value.forEach((value) => {
        if (isLeafChild(valueToChild(value))) internalUpdate(value, result, 1, 1);
      });
      correctedCheckedSet.value = result;
      onChange(methods._(result));
    },
  });
  return {
    ...methods,
    isIntermediate: (value: unknown) => intermediateSet.value.has(valueToChild(value)!),
  };
}
