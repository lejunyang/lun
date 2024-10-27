import { watchOnMounted } from '@lun-web/core';
import { reactive, Ref, ref } from 'vue';
import { at } from '@lun-web/utils';
import { createCount, getLevel, getValue, isLeafChild, isDisabled, Item, getChildren, getParent } from './tree.common';

export function useTreeCheckedValue(
  childrenInfo: {
    items: Item[];
  },
  checkedValueSet: Ref<Set<any>>,
) {
  const correctedCheckedSet = reactive(new Set<any>()),
    itemDirectCheckedChildrenCountMap = ref(new WeakMap<Item, number>()),
    // TODO add itemNestedCheckedChildrenCountMap for intermediate
    itemDisabledChildrenCountMap = ref(new WeakMap<Item, number>());

  // TODO check uncheck update; what about disabled update if not using watchEffect?  add checkedValueSet as a watch source
  watchOnMounted(
    () => childrenInfo.items,
    (items) => {
      correctedCheckedSet.clear();
      const checkedChildrenCountMap = new WeakMap<Item, number>(),
        disabledChildrenCountMap = new WeakMap<Item, number>();

      const countUp = createCount(checkedChildrenCountMap, 1),
        disableCountUp = createCount(disabledChildrenCountMap, 1);

      const checked = checkedValueSet.value;
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
          correctedCheckedSet.add(getValue(topVm));
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

        if (isChecked || (parentCheckedLevel! < level && !disabled)) correctedCheckedSet.add(childValue);
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
    },
  );

  return [correctedCheckedSet, itemDirectCheckedChildrenCountMap, itemDisabledChildrenCountMap] as const;
}
