import { TableSetupProps } from './type';
import { isFunction, runIfFn } from '@lun-web/utils';
import { renderCustom } from '../custom-renderer/CustomRenderer';
import { fComputed, useExpandMethods } from '@lun-web/core';
import { useValueModel, useValueSet } from 'hooks';
import { getRowKey } from './utils';

export default (
  props: TableSetupProps,
  data: () => (readonly [row: unknown, i: number, key: any])[],
  maxLevel: () => number,
) => {
  const expandableKeySet = fComputed(() => {
    const keys = new Set(),
      { expandable } = props;
    if (isFunction(expandable)) {
      data().map(([row, i, key]) => {
        if (expandable(row, i)) keys.add(key);
      });
    }
    return keys;
  });

  const key = 'rowExpanded',
    expandedModel = useValueModel(props, {
      key,
      hasRaw: true,
      eventName: key,
    }),
    expandedSet = useValueSet(expandedModel, true);

  const expandMethods = useExpandMethods({
    multiple: true,
    current: expandedSet,
    onChange(value) {
      expandedModel.value = value;
    },
    allValues: expandableKeySet,
  });

  const hasExpand = () => expandableKeySet().size > 0,
    canExpand = (key: any) => expandableKeySet().has(key);

  const getRowHeight = (row: unknown, index: number) => {
    const key = getRowKey(props, row, index);
    if (!hasExpand() || !canExpand(key)) return '';
    else return expandMethods.isExpanded(key) ? ' 1fr' : ' 0fr';
  };

  return [
    /** render the expanded content of expandable rows */
    (wrapperProps?: Record<string, any>) =>
      hasExpand()
        ? data().map(([row, rowIndex, key], i) =>
            canExpand(key) ? (
              <div
                style={{
                  gridColumn: '1/-1',
                  minHeight: 0,
                  overflow: 'hidden',
                  gridRow: `${maxLevel() + (i + 1) * 2}`,
                }}
                {...wrapperProps}
              >
                {renderCustom(runIfFn(props.expandedRenderer, row, rowIndex))}
              </div>
            ) : undefined,
          )
        : undefined,
    getRowHeight,
    expandMethods,
  ] as const;
};
