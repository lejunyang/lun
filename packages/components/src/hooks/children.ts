import {
  CollectorParentReturn,
  fComputed,
  isCollectedItemLeaf,
  MaybeRefLikeOrGetter,
  objectComputed,
  unrefOrGet,
} from '@lun-web/core';
import { ensureArray } from '@lun-web/utils';
import { isVmDisabled } from 'utils';
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
          if (tree && !isCollectedItemLeaf(child)) noneLeafValuesSet.add(value);
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

export function usePropChildrenRender<T extends Record<string, unknown>, R = any>(
  itemsGetter: MaybeRefLikeOrGetter<T[]>,
  render: (item: T, childrenRenderResult?: NoInfer<R>[]) => R,
  tree?: number,
  itemPropsMapGetter?: MaybeRefLikeOrGetter<object>,
) {
  const childrenMap = new WeakMap<T, any[]>();

  const processItem = (item: T) => {
    const propsMap = unrefOrGet(itemPropsMapGetter);
    const newItem: any = { ...item };
    if (propsMap)
      Object.entries(propsMap).forEach(([key, value]) => {
        newItem[key] = item[value];
        newItem[value] = undefined;
      });
    if (tree) {
      if (newItem.children) {
        childrenMap.set(newItem, processArray(ensureArray(newItem.children)));
      }
      delete newItem.children; // in case children is set as a prop on element
    }
    return newItem;
  };
  const processArray = (arr?: any[] | null) => ensureArray(arr).map((item) => processItem(item));

  const processedItems = fComputed(() => processArray(unrefOrGet(itemsGetter)));

  const renderItems = (arr?: T[] | null): any =>
    arr?.length ? arr.map((i) => render(i, renderItems(childrenMap.get(i) as T[]))) : undefined;

  return () => renderItems(processedItems());
}
