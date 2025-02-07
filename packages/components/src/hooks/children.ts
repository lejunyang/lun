import {
  CollectorParentReturn,
  fComputed,
  isCollectedItemLeaf,
  MaybeRefLikeOrGetter,
  objectComputed,
  unrefOrGet,
  useEdit,
  useRefSet,
} from '@lun-web/core';
import { ensureArray } from '@lun-web/utils';
import { isVmDisabled } from 'utils';
import { ComponentInternalInstance, nextTick, onMounted, watch } from 'vue';

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

export function useChildrenValue() {
  const childrenValues = useRefSet(),
    [, addChildValue, deleteChildValue] = childrenValues,
    noneLeafValues = useRefSet(),
    [, addNoneLeafValue, deleteNoneLeafValue] = noneLeafValues,
    valueToChildMap = new Map<any, ComponentInternalInstance>();

  return [
    /** child setup */
    (props: any, instance: ComponentInternalInstance) => {
      const editComputed = useEdit()!;
      const getVal = () => props.value,
        isDisabled = () => editComputed.disabled;
      const removeValue = (val: any) => {
        deleteChildValue(val);
        valueToChildMap.delete(val);
        deleteNoneLeafValue(val);
      };
      onMounted(() => {
        let isLeaf: boolean | undefined;
        watch(
          getVal,
          (value, old) => {
            if (value != null && !isDisabled()) {
              addChildValue(value);
              valueToChildMap.set(value, instance);
              if (isLeaf === true) addNoneLeafValue(value);
            }
            removeValue(old);
          },
          { immediate: true },
        );
        watch(isDisabled, (disabled) => {
          if (disabled) removeValue(getVal());
        });
        nextTick(() => {
          if (!(isLeaf = isCollectedItemLeaf(instance)) && !isDisabled()) addNoneLeafValue(getVal());
        });
      });
    },
    childrenValues,
    noneLeafValues,
    /** value to child */
    (value: any) => valueToChildMap.get(value),
    /** value to label */
    (value: any) => valueToChildMap.get(value)?.props.label as string | undefined,
  ] as const;
}
