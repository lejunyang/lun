import { defineSSRCustomElement } from 'custom';
import { createDefineElement, getProp, renderElement } from 'utils';
import { TableColumnSetupProps, tableEmits, tableProps } from './type';
import { useCE, useNamespace } from 'hooks';
import { getCompParts } from 'common';
import { TableColumnCollector } from './collector';
import { ensureArray, ensureNumber, runIfFn, toPxIfNum } from '@lun-web/utils';
import {
  getCollectedItemTreeLevel,
  getCollectedItemTreeParent,
  isCollectedItemLeaf,
  useCollectorExternalChildren,
  useStickyTable,
  useWeakMap,
  useWeakSet,
  fComputed,
  useVirtualList,
} from '@lun-web/core';
import { ComponentInternalInstance, computed, watchEffect } from 'vue';
import useColumnResizer from './Table.ColumnResizer';
import useRowExpand from './Table.RowExpand';
import { getRowKey } from './utils';
import { defineTableColumn } from './TableColumn';
import { InternalColumn } from './internalType';

const name = 'table';
const parts = ['root', 'virtual-wrapper', 'expanded-content', 'resizer'] as const;
const compParts = getCompParts(name, parts);
export const Table = defineSSRCustomElement({
  name,
  props: tableProps,
  emits: tableEmits,
  setup(props) {
    const ns = useNamespace(name);
    const ce = useCE();
    const collapsed = useWeakSet(),
      [replaceCollapsed, , addCollapsed] = collapsed,
      cellMerge = useWeakMap<InternalColumn, [startRowIndex: number, mergedCount: number][]>(),
      columnVmMap = useWeakMap<TableColumnSetupProps, ComponentInternalInstance>(),
      getColumnVm = columnVmMap[1],
      [, getColumnWidth, setColumnWidth] = useWeakMap<InternalColumn, number>();

    const data = computed(() => ensureArray(props.data));
    const [columns, renderColumns] = useCollectorExternalChildren(
      () => props.columns,
      (column, children) =>
        renderElement('table-column', { ...column, /** _ is for internal usage in column */ _: column }, children),
      () => props.columnPropsMap,
      true,
    );

    const [renderResizer, showResize] = useColumnResizer(setColumnWidth);

    const maxLevel = () => Math.max(context.state.maxChildLevel, columns.maxChildLevel) + 1,
      all = fComputed(() => (columns.items as InternalColumn[]).concat(context.value));

    const virtualOff = () => !props.virtual,
      virtual = useVirtualList({
        items: data,
        itemKey: (item, index) => getRowKey(props, item, index),
        container: ce,
        observeContainerSize: true,
        disabled: virtualOff,
        estimatedSize: (item, index) => {
          const height = runIfFn(props.rowHeight, item, index);
          return ensureNumber(height, 44);
        },
        staticPosition: true,
      }),
      virtualData = fComputed(() =>
        virtualOff()
          ? data.value.map((row, i) => [row, i, getRowKey(props, row, i)] as const)
          : virtual.virtualItems.value.map((v) => [v.item, v.index, v.key] as const),
      );
    const [renderExpand, getExpandRowHeight, rowExpand] = useRowExpand(props, virtualData, maxLevel);
    const context = TableColumnCollector.parent({
      extraProvide: {
        collapsed,
        cellMerge,
        columnVmMap,
        columns,
        maxLevel,
        all,
        showResize,
        virtual,
        data: virtualData,
        rowExpand,
      },
    });

    watchEffect(() => {
      replaceCollapsed();
      let collapseCount = 0;
      all().forEach((child) => {
        if (!isCollectedItemLeaf(child) || getCollectedItemTreeLevel(child)! > 0) return (collapseCount = 0);
        if (--collapseCount > 0) addCollapsed(child);
        else collapseCount = +getProp(child, 'headerColSpan')!;
      });
    });

    const getSticky = (vm: ComponentInternalInstance) =>
        (vm.props as TableColumnSetupProps).sticky as 'left' | 'right' | undefined,
      getSelfOrParent = (vm: ComponentInternalInstance | undefined): ReturnType<typeof getSticky> =>
        vm && (getSticky(vm) || getSelfOrParent(getCollectedItemTreeParent(vm) as ComponentInternalInstance));
    useStickyTable(() => columns.items.map(getColumnVm).concat(context.value), getSelfOrParent);

    const dataTemplateRows = fComputed(() =>
      virtualData()
        .map(([row, i]) => (toPxIfNum(runIfFn(props.rowHeight, row, i)) || 'auto') + getExpandRowHeight(row, i))
        .join(' '),
    );
    const style = fComputed(() => ({
      ...props.rootStyle,
      display: 'grid',
      gridAutoFlow: 'column',
      gridTemplateRows:
        (props.noHeader ? '' : `repeat(${maxLevel()}, ${toPxIfNum(props.headerHeight) || 'auto'}) `) +
        dataTemplateRows(),
      gridTemplateColumns: all()
        .map((child) =>
          isCollectedItemLeaf(child)
            ? toPxIfNum(getColumnWidth(child) ?? getProp(child, 'width')) || 'max-content'
            : '',
        )
        .join(' '),
    }));

    return () => {
      const node = (
        <div class={ns.t} part={compParts[0]} style={style()}>
          {renderExpand({
            class: ns.e('expanded-content'),
            part: compParts[2],
          })}
          {renderColumns()}
          <slot></slot>
          {renderResizer({
            class: ns.e('resizer'),
            part: compParts[3],
          })}
        </div>
      );
      return virtualOff() ? (
        node
      ) : (
        <div style={virtual.wrapperStyle.value} part={compParts[1]}>
          {node}
        </div>
      );
    };
  },
});

export type tTable = typeof Table;
export type TableExpose = {};
export type iTable = InstanceType<tTable> & TableExpose;

export const defineTable = createDefineElement(name, Table, {}, parts, {
  'table-column': defineTableColumn,
});
