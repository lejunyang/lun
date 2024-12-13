import { EditState, useCollectorExternalChildren } from '@lun-web/core';
import { renderElement } from 'utils';
import { shallowReactive } from 'vue';

export function useTreeItems(props: { items?: any[]; itemPropsMap?: object }, editComputed: EditState) {
  let childrenValuesSet = new Set(),
    valueToChildMap = new Map<any, unknown>(),
    noneLeafValuesSet = new Set();
  const valueInfo = shallowReactive({
    childrenValuesSet,
    valueToChildMap,
    noneLeafValuesSet,
  });
  const [state, render] = useCollectorExternalChildren(
    () => props.items,
    (item, children) => renderElement('tree-item', item, children as any),
    () => props.itemPropsMap,
    true,
    () => {
      valueInfo.childrenValuesSet = childrenValuesSet = new Set();
      valueInfo.valueToChildMap = valueToChildMap = new Map<any, unknown>();
      valueInfo.noneLeafValuesSet = noneLeafValuesSet = new Set();
    },
    (item) => {
      Object.entries(editComputed).forEach(([key, value]) => {
        item[key] ??= value;
      });
      if (!item.disabled) childrenValuesSet.add(item.value);
      valueToChildMap.set(item.value, item);
      item.key ??= item.value;
    },
    (item, children) => {
      if(children.length && !item.disabled) noneLeafValuesSet.add(item.value);
    }
  );

  return [state, valueInfo, render, (value: any) => valueInfo.valueToChildMap.get(value)] as const;
}
