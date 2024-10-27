import { EditState, objectComputed } from '@lun-web/core';
import { ensureArray } from '@lun-web/utils';
import { renderElement } from 'utils';

export type InternalTreeItem = {
  value: any;
  label: any;
  key: any;
  _: {
    level: number;
    parent?: InternalTreeItem;
    children: InternalTreeItem[];
    readonly isLeaf: boolean;
  };
} & EditState;

export function useTreeItems(props: { items?: any[]; itemPropsMap?: object }, editComputed: EditState) {
  const info = objectComputed(() => {
    const childrenValuesSet = new Set(),
      valueToChildMap = new Map<any, InternalTreeItem>(),
      noneLeafValuesSet = new Set();
    const { items, itemPropsMap } = props;
    const processItem = (item: any, parent?: any) => {
      if (itemPropsMap)
        Object.entries(itemPropsMap).forEach(([key, value]) => {
          item[key] = item[value];
          item[value] = undefined;
        });
      Object.entries(editComputed).forEach(([key, value]) => {
        item[key] ??= value;
      });
      if (!item.disabled) childrenValuesSet.add(item.value);
      valueToChildMap.set(item.value, item);
      item.key ??= item.value;
      item._ = {
        level: (parent?.level ?? -1) + 1,
        parent,
        get isLeaf() {
          return !this.children?.length;
        },
      };
    };
    const processArray = (arr?: any[], parent?: any) => {
      return ensureArray(arr).flatMap((item) => {
        if (!item) return [];
        processItem(item, parent);
        if (!(item._.children = processArray(item.children, item)).length && !item.disabled)
          noneLeafValuesSet.add(item.value);
        return [item];
      });
    };

    return {
      items: processArray(items) as InternalTreeItem[],
      childrenValuesSet,
      valueToChildMap,
      noneLeafValuesSet,
    };
  });

  const renderItems = (arr: InternalTreeItem[]): any =>
    arr.map(({ _: { children }, ...rest }) => renderElement('tree-item', rest, renderItems(children)));

  return [info, () => renderItems(info.items), (value: any) => info.valueToChildMap.get(value)] as const;
}
