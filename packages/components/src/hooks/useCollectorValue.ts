import { CollectorParentReturn, objectComputed } from '@lun/core';
import { isLeafChild, isVmDisabled } from '../components/tree/tree.common';
import { ComponentInternalInstance } from 'vue';

export function useCollectorValue(context: () => CollectorParentReturn, tree?: boolean) {
  const childrenInfo = objectComputed(() => {
    const childrenValuesSet = new Set<any>(),
      noneLeafValuesSet = new Set<any>();
    const valueToChildMap = new Map<any, ComponentInternalInstance>();
    context().value.forEach((child) => {
      const { value } = child.props;
      if (value != null) {
        !isVmDisabled(child) && childrenValuesSet.add(value); // exclude disabled option from value set
        if (tree && !isLeafChild(child)) noneLeafValuesSet.add(value);
        valueToChildMap.set(value, child);
      }
    });
    return { childrenValuesSet, valueToChildMap, noneLeafValuesSet };
  });
  const valueToChild = (value: any) => childrenInfo.valueToChildMap.get(value);
  const valueToLabel = (value: any) => valueToChild(value)?.props.label as string | undefined;
  return [childrenInfo, valueToChild, valueToLabel] as const;
}
