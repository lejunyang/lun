import {
  getCollectedItemTreeLevel,
  ToAllMaybeRefLike,
  useCheckboxMethods,
  useRefSet,
  useRefWeakMap,
  useRefWeakSet,
  getCollectedItemTreeParent,
  getCollectedItemTreeChildren,
  isCollectedItemLeaf,
  createMapCountMethod,
} from '@lun-web/core';
import { at } from '@lun-web/utils';
import { ComputedRef, onMounted, watch } from 'vue';
import { getValue, isDisabled, Item } from './tree.common';

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
  const correctedCheckedSet = useRefSet(),
    [, addChecked, , replaceChecked] = correctedCheckedSet,
    itemDirectCheckedChildrenCountMap = useRefWeakMap<Item, number>(),
    [getCheckedCount, setCheckedCount, , replaceCheckedCount] = itemDirectCheckedChildrenCountMap,
    [getDisabledCount, , , replaceDisabledCount] = useRefWeakMap<Item, number>(),
    [hasIntermediate, addIntermediate, deleteIntermediate, replaceIntermediate] = useRefWeakSet<Item>();
  const { current, onChange, valueToChild, childrenInfo } = options;
  const countUp = createMapCountMethod(itemDirectCheckedChildrenCountMap, 1),
    countDown = createMapCountMethod(itemDirectCheckedChildrenCountMap, -1);
  const [, methods] = useCheckboxMethods(options as any);

  const getChildrenCount = (item: Item) => {
    const children = getCollectedItemTreeChildren(item);
    return children.length - (getDisabledCount(item) || 0);
  };

  // TODO watch disabled update
  const correctChecked = (items: Item[]) => {
    replaceChecked();
    replaceIntermediate();
    const checkedChildrenCountMap = new WeakMap<Item, number>(),
      disabledChildrenCountMap = new WeakMap<Item, number>();

    const countUp = createMapCountMethod(checkedChildrenCountMap, 1),
      disableCountUp = createMapCountMethod(disabledChildrenCountMap, 1);

    const checked = current.value;
    let lastNoneLeafLevel: number | undefined,
      parentCheckedLevel: number | undefined,
      toBeCheckedVmStack: Item[] = [];

    const traverse = (stopLevel: number) => {
      if (!toBeCheckedVmStack.length) return;
      const topVm = at(toBeCheckedVmStack, -1)!;
      if (getCollectedItemTreeLevel(topVm)! < stopLevel) return;
      toBeCheckedVmStack.pop();
      const checkedCount = checkedChildrenCountMap.get(topVm),
        parent = getCollectedItemTreeParent(topVm),
        validChildrenCount = getChildrenCount(topVm);
      if (checkedCount === validChildrenCount) {
        // all children(except disabled) are checked
        addChecked(getValue(topVm));
        deleteIntermediate(topVm);
        parent && countUp(parent);
        traverse(stopLevel);
      } else if (checkedCount! > 0) {
        addIntermediate(topVm);
        // if item itself is intermediate, its all parents must also be intermediate. update that when stopLevel is 0
        if (!stopLevel) toBeCheckedVmStack.forEach((vm) => addIntermediate(vm));
      } else deleteIntermediate(topVm);
    };

    items.forEach((child) => {
      const level = getCollectedItemTreeLevel(child)!,
        isLeaf = isCollectedItemLeaf(child),
        parent = getCollectedItemTreeParent(child),
        disabled = isDisabled(child),
        childValue = getValue(child),
        isChecked = checked.has(childValue);

      if (parent && disabled) disableCountUp(parent);

      if (isChecked || (parentCheckedLevel! < level && !disabled)) addChecked(childValue);
      if (isChecked && !isLeaf && parentCheckedLevel === undefined) parentCheckedLevel = level;

      if (level === lastNoneLeafLevel) traverse(level);
      if (level >= lastNoneLeafLevel! || !level) {
        if (!isLeaf) toBeCheckedVmStack.push(child);
        else if (isChecked) countUp(parent);
      } else parentCheckedLevel = undefined;

      if (!isLeaf) lastNoneLeafLevel = level;
    });

    traverse(0);

    replaceCheckedCount(checkedChildrenCountMap);
    replaceDisabledCount(disabledChildrenCountMap);
  };
  onMounted(() => {
    watch(() => childrenInfo.items, correctChecked, { immediate: true });
  });
  watch(current, (currentChecked) => {
    if (currentChecked !== correctedCheckedSet.value) {
      correctChecked(childrenInfo.items); // TODO items props with initial checked, see if intermediate is correct
    }
  });

  const updateParentIntermediate = (item: Item, isCheck: number) => {
    const parent = getCollectedItemTreeParent(item) as Item;
    if (!parent) return;
    const parentCheckedCount = getCheckedCount(parent),
      childrenCount = getChildrenCount(parent),
      isIntermediate = hasIntermediate(parent);
    if (
      !isIntermediate &&
      // if isCheck is true, normally we should update all parents to intermediate, unless all of its children are checked
      ((isCheck && parentCheckedCount !== childrenCount) ||
        // this is for isCheck=false
        (parentCheckedCount && parentCheckedCount < childrenCount))
    ) {
      // don't need to check `isCheck`, as both check and uncheck can lead to intermediate state
      addIntermediate(parent);
      return updateParentIntermediate(parent, 1);
    }
    if (
      !isCheck &&
      isIntermediate &&
      // if parent still has checked children, it is still intermediate
      !parentCheckedCount &&
      // check other children that are not checked but may be intermediate
      getCollectedItemTreeChildren(parent).every((c) => !hasIntermediate(c as Item) || isDisabled(c as Item))
    ) {
      deleteIntermediate(parent);
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
    const isLeaf = isCollectedItemLeaf(currentVm),
      parent = getCollectedItemTreeParent(currentVm) as Item;
    let shouldUpdateParentCheck: number;
    // check/uncheck self
    if (isUnCheck) {
      shouldUpdateParentCheck = 1;
      currentChecked.delete(value);
    } else {
      // updateParent === -1: it's from children's update, then need to check if all its children are checked and then check itself
      if (updateParent !== -1 || getCheckedCount(currentVm) === getChildrenCount(currentVm)) {
        shouldUpdateParentCheck = 1;
        currentChecked.add(value);
      }
    }
    deleteIntermediate(currentVm);
    if (!isLeaf && updateParent !== -1) {
      setCheckedCount(currentVm, isUnCheck ? 0 : getChildrenCount(currentVm));
      getCollectedItemTreeChildren(currentVm).forEach((c) =>
        internalUpdate(getValue(c as Item), currentChecked, 0, isUnCheck),
      );
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
    replaceCheckedCount();
    childrenInfo.noneLeafValuesSet.forEach((value) => {
      const item = valueToChild(value);
      if (item) setCheckedCount(item, getChildrenCount(item));
    });
  };

  Object.assign(methods, {
    checkAll() {
      replaceIntermediate();
      internalCheckAll();
      onChange(methods._(replaceChecked(childrenInfo.childrenValuesSet)));
    },
    uncheckAll() {
      replaceIntermediate();
      replaceCheckedCount();
      onChange(methods._(replaceChecked()));
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
      correctedCheckedSet.forEach((value) => {
        if (isCollectedItemLeaf(valueToChild(value))) internalUpdate(value, result, 1, 1);
      });
      replaceChecked(result);
      onChange(methods._(result));
    },
  });
  return {
    ...methods,
    isIntermediate: (value: unknown) => hasIntermediate(valueToChild(value)!),
  };
}
