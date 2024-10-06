import { watchEffectOnMounted } from '@lun/core';
import { ComponentInternalInstance, reactive, Ref, ref } from 'vue';
import { TreeParentContext } from './collector';
import { at } from '@lun/utils';
import { createCount, getLevel, getValue, isLeafChild } from './tree.common';

export function useTreeCheckedValue(context: () => TreeParentContext, checkedValueSet: Ref<Set<any>>) {
  const correctedCheckedSet = reactive(new Set<any>()),
    vmCheckedChildrenCountMap = ref(new WeakMap<ComponentInternalInstance, number>());

  watchEffectOnMounted(() => {
    correctedCheckedSet.clear();
    const checkedChildrenCountMap = new WeakMap<ComponentInternalInstance, number>();

    const countUp = createCount(checkedChildrenCountMap, 1);
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
      // TODO haven't considering disabled children, should add disabled count in useCollectorValue and use it here
      if (checkedCount === children.length) {
        // all children are checked
        correctedCheckedSet.add(getValue(topVm));
        parent && countUp(parent);
        traverse(stopLevel);
      }
    };

    value.forEach((child) => {
      const level = getLevel(child),
        isLeaf = isLeafChild(child),
        childValue = getValue(child),
        isChecked = checked.has(childValue);

      if (isChecked || parentCheckedLevel! < level) correctedCheckedSet.add(childValue);
      if (isChecked && !isLeaf && parentCheckedLevel === undefined) parentCheckedLevel = level;

      if (level === lastNoneLeafLevel) traverse(level);
      if (level >= lastNoneLeafLevel! || !level) {
        if (!isLeaf) {
          toBeCheckedVmStack.push(child);
        } else if (checked) {
          countUp(at(toBeCheckedVmStack, -1));
        }
      } else {
        parentCheckedLevel = undefined;
      }

      if (!isLeaf) lastNoneLeafLevel = level;
    });

    traverse(0);

    vmCheckedChildrenCountMap.value = checkedChildrenCountMap;
  });

  return [correctedCheckedSet, vmCheckedChildrenCountMap] as const;
}
