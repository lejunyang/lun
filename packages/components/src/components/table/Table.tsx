import { defineSSRCustomElement } from 'custom';
import { createDefineElement, getProp, renderElement } from 'utils';
import { InternalColumn, TableColumnSetupProps, tableEmits, tableProps } from './type';
import { useCE, useNamespace } from 'hooks';
import { getCompParts } from 'common';
import { TableColumnCollector } from './collector';
import { ensureArray, runIfFn, toPxIfNum } from '@lun-web/utils';
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
  UseVirtualMeasurement,
} from '@lun-web/core';
import { ComponentInternalInstance, computed, watchEffect } from 'vue';
import useColumnResizer from './Table.ColumnResizer';

const name = 'table';
const parts = ['root'] as const;
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
      () => undefined,
      true,
    );

    const [resizerProps, showResize] = useColumnResizer(setColumnWidth);

    const maxLevel = () => Math.max(context.state.maxChildLevel, columns.maxChildLevel) + 1,
      all = fComputed(() => (columns.items as InternalColumn[]).concat(context.value));

    const virtualOff = () => !props.virtual,
      virtual = useVirtualList({
        items: data,
        container: ce,
        observeContainerSize: true,
        disabled: virtualOff,
        estimatedSize: 44,
        staticPosition: true,
      }),
      virtualData = fComputed(() => (virtualOff() ? data.value : virtual.virtualItems.value));
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

    const getSticky = (vm: ComponentInternalInstance) => (vm.props as TableColumnSetupProps).sticky,
      getSelfOrParent = (vm: ComponentInternalInstance | undefined): ReturnType<typeof getSticky> =>
        vm && (getSticky(vm) || getSelfOrParent(getCollectedItemTreeParent(vm) as ComponentInternalInstance));
    useStickyTable(() => columns.items.map(getColumnVm).concat(context.value), getSelfOrParent);

    const dataTemplateRows = fComputed(() =>
      virtualData()
        .map(
          (row, i) =>
            toPxIfNum(runIfFn(props.rowHeight, virtualOff() ? row : (row as UseVirtualMeasurement).item, i)) || 'auto',
        )
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
          {renderColumns()}
          <slot></slot>
          <div class={ns.e('resizer')} {...resizerProps}></div>
        </div>
      );
      return virtualOff() ? node : <div style={virtual.wrapperStyle.value}>{node}</div>;
    };
  },
});

export type tTable = typeof Table;
export type TableExpose = {};
export type iTable = InstanceType<tTable> & TableExpose;

export const defineTable = createDefineElement(name, Table, {}, parts, {});
