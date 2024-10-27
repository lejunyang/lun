import { CollectorParentReturn, objectComputed } from '@lun-web/core';
import { isVmLeafChild, isVmDisabled } from 'utils';
import { ComponentInternalInstance } from 'vue';

export function useCollectorValue(context: () => CollectorParentReturn, tree?: boolean) {
  const childrenInfo = objectComputed(() => {
    const childrenValuesSet = new Set<any>(),
      noneLeafValuesSet = new Set<any>(),
      valueToChildMap = new Map<any, ComponentInternalInstance>();
    context().value.forEach((child) => {
      const { value } = child.props;
      if (value != null) {
        // exclude disabled option from value set
        if (!isVmDisabled(child)) {
          childrenValuesSet.add(value);
          if (tree && !isVmLeafChild(child)) noneLeafValuesSet.add(value);
        }
        valueToChildMap.set(value, child);
      }
    });
    return { childrenValuesSet, valueToChildMap, noneLeafValuesSet };
  });
  const valueToChild = (value: any) => childrenInfo.valueToChildMap.get(value);
  const valueToLabel = (value: any) => valueToChild(value)?.props.label as string | undefined;
  return [childrenInfo, valueToChild, valueToLabel] as const;
}
