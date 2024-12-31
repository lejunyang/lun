import { TableSetupProps } from './type';
import { isFunction } from '@lun-web/utils';
import { renderCustom } from '../custom-renderer/CustomRenderer';
import { fComputed, useExpandMethods, useRefSet } from '@lun-web/core';
import { useValueModel, useValueSet } from 'hooks';
import { getRowKey } from './utils';
import { shallowRef, watchEffect } from 'vue';

export default (
  props: TableSetupProps,
  data: () => (readonly [row: unknown, i: number, key: any])[],
  maxLevel: () => number,
) => {
  const expandableKeySet = useRefSet(),
    [canExpand, addExpandKey, , replace] = expandableKeySet,
    expandedContentArr = shallowRef([] as ([any, number] | undefined)[]);
  watchEffect(() => {
    replace();
    const { rowExpandedRenderer } = props;
    if (!isFunction(rowExpandedRenderer)) return;
    let expandCount = 0;
    expandedContentArr.value = data().map(([row, rowIndex, key], i) => {
      const content = rowExpandedRenderer(row, rowIndex);
      if (content != null) {
        addExpandKey(key);
        return [content, i + ++expandCount + 1];
      }
    });
  });

  const expandedModel = useValueModel(props, {
      key: 'rowExpanded',
      hasRaw: true,
      eventName: 'rowExpand',
    }),
    expandedSet = useValueSet(expandedModel, true);

  const [, expandMethods] = useExpandMethods({
    multiple: true,
    current: expandedSet,
    onChange(value) {
      expandedModel.value = value as any;
    },
    allValues: expandableKeySet,
  });

  const hasExpand = fComputed(() => expandableKeySet.value.size > 0);

  const getRowHeight = (row: unknown, index: number) => {
    const key = getRowKey(props, row, index);
    if (!hasExpand() || !canExpand(key)) return '';
    else return expandMethods.isExpanded(key) ? ' 1fr' : ' 0fr';
  };

  return [
    /** render the expanded content of expandable rows */
    (wrapperProps?: Record<string, any>) =>
      hasExpand()
        ? expandedContentArr.value.map(
            (content) =>
              content != null && (
                <div
                  style={{
                    gridColumn: '1/-1',
                    minHeight: 0,
                    overflow: 'hidden',
                    gridRow: `${maxLevel() + content[1]}`,
                  }}
                  {...wrapperProps}
                >
                  {renderCustom(content[0])}
                </div>
              ),
          )
        : undefined,
    getRowHeight,
    expandMethods,
  ] as const;
};
