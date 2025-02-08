import {
  fComputed,
  isCollectedItemLeaf,
  MaybeRefLikeOrGetter,
  unrefOrGet,
  useEdit,
  useRefMap,
  useRefSet,
} from '@lun-web/core';
import { ensureArray, runIfFn } from '@lun-web/utils';
import { ComponentInternalInstance, nextTick, onMounted, watch, watchEffect } from 'vue';

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

export function useChildrenValue<ChildProps>(invalidCondition?: (props: ChildProps) => boolean | undefined) {
  const childrenValues = useRefSet(),
    [, addChildValue, deleteChildValue] = childrenValues,
    noneLeafValues = useRefSet(),
    [, addNoneLeafValue, deleteNoneLeafValue] = noneLeafValues,
    valueToChildMap = useRefMap<any, ComponentInternalInstance>(),
    [getChild, setValueToChild, deleteValueToChild] = valueToChildMap;

  return [
    /** child setup */
    (props: any, instance: ComponentInternalInstance) => {
      const editComputed = useEdit()!;
      const getVal = () => props.value,
        isInvalid = () => editComputed.disabled || runIfFn(invalidCondition, props);
      const removeValue = (val: any) => {
        deleteChildValue(val);
        deleteNoneLeafValue(val);
      };
      onMounted(() => {
        let isLeaf: boolean | undefined;
        watch(
          getVal,
          (value, old) => {
            if (value != null) {
              setValueToChild(value, instance);
              if (!isInvalid()) {
                addChildValue(value);
                if (isLeaf === true) addNoneLeafValue(value);
              }
            }
            removeValue(old);
            deleteValueToChild(old);
          },
          { immediate: true },
        );
        watchEffect(() => {
          if (isInvalid()) removeValue(getVal());
        });
        nextTick(() => {
          if (!(isLeaf = isCollectedItemLeaf(instance)) && !isInvalid()) addNoneLeafValue(getVal());
        });
      });
    },
    childrenValues,
    noneLeafValues,
    /** value to child */
    getChild,
    /** value to label */
    (value: any) => getChild(value)?.props.label as string | undefined,
  ] as const;
}
