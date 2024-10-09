import { watchEffectOnMounted } from '@lun/core';
import { ComponentInternalInstance, reactive, Ref, ref } from 'vue';
import { TreeParentContext } from './collector';
import { at } from '@lun/utils';
import { createCount, getLevel, getValue, isLeafChild, isVmDisabled } from './tree.common';

export function useTreeCheckedValue(context: () => TreeParentContext, checkedValueSet: Ref<Set<any>>) {
  const correctedCheckedSet = reactive(new Set<any>()),
    vmDirectCheckedChildrenCountMap = ref(new WeakMap<ComponentInternalInstance, number>()),
    // TODO add vmNestedCheckedChildrenCountMap for intermediate
    vmDisabledChildrenCountMap = ref(new WeakMap<ComponentInternalInstance, number>());

  watchEffectOnMounted(() => {
    correctedCheckedSet.clear();
    const checkedChildrenCountMap = new WeakMap<ComponentInternalInstance, number>(),
      disabledChildrenCountMap = new WeakMap<ComponentInternalInstance, number>();

    const countUp = createCount(checkedChildrenCountMap, 1),
      disableCountUp = createCount(disabledChildrenCountMap, 1);
    const { value, getVmTreeChildren, getVmTreeParent } = context(),
      checked = checkedValueSet.value;
    let lastNoneLeafLevel: number | undefined,
      parentCheckedLevel: number | undefined,
      toBeCheckedVmStack: ComponentInternalInstance[] = [];

    const traverse = (stopLevel: number) => {
      if (!toBeCheckedVmStack.length) return;
      const topVm = at(toBeCheckedVmStack, -1)!;
      if (getLevel(topVm) < stopLevel) return;
      toBeCheckedVmStack.pop();
      const checkedCount = checkedChildrenCountMap.get(topVm),
        children = getVmTreeChildren(topVm),
        parent = getVmTreeParent(topVm);
      if (checkedCount === children.length - (disabledChildrenCountMap.get(topVm) || 0)) {
        // all children(except disabled) are checked
        correctedCheckedSet.add(getValue(topVm));
        parent && countUp(parent);
        traverse(stopLevel);
      }
    };

    value.forEach((child) => {
      const level = getLevel(child),
        isLeaf = isLeafChild(child),
        parent = getVmTreeParent(child),
        isDisabled = isVmDisabled(child),
        childValue = getValue(child),
        isChecked = checked.has(childValue);

      if (parent && isDisabled) disableCountUp(parent);

      if (isChecked || (parentCheckedLevel! < level && !isDisabled)) correctedCheckedSet.add(childValue);
      if (isChecked && !isLeaf && parentCheckedLevel === undefined) parentCheckedLevel = level;

      if (level === lastNoneLeafLevel) traverse(level);
      if (level >= lastNoneLeafLevel! || !level) {
        if (!isLeaf) toBeCheckedVmStack.push(child);
        else if (isChecked) countUp(parent);
      } else parentCheckedLevel = undefined;

      if (!isLeaf) lastNoneLeafLevel = level;
    });

    traverse(0);

    vmDirectCheckedChildrenCountMap.value = checkedChildrenCountMap;
    vmDisabledChildrenCountMap.value = disabledChildrenCountMap;
  });

  return [correctedCheckedSet, vmDirectCheckedChildrenCountMap, vmDisabledChildrenCountMap] as const;
}
