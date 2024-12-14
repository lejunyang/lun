import { defineSSRCustomElement } from 'custom';
import { createDefineElement, getProp, renderElement } from 'utils';
import { TableColumnSetupProps, tableEmits, tableProps } from './type';
import { useNamespace } from 'hooks';
import { getCompParts } from 'common';
import { TableColumnCollector } from './collector';
import { ensureArray, toPxIfNum } from '@lun-web/utils';
import {
  getCollectedItemTreeLevel,
  getCollectedItemTreeParent,
  isCollectedItemLeaf,
  useCollectorExternalChildren,
  useStickyTable,
  useWeakMap,
  useWeakSet,
  fComputed,
} from '@lun-web/core';
import { ComponentInternalInstance, computed, watchEffect } from 'vue';

const name = 'table';
const parts = ['root'] as const;
const compParts = getCompParts(name, parts);
export const Table = defineSSRCustomElement({
  name,
  props: tableProps,
  emits: tableEmits,
  setup(props) {
    const ns = useNamespace(name);
    const collapsed = useWeakSet(),
      [replaceCollapsed, , addCollapsed] = collapsed,
      cellMerge = useWeakMap<
        ComponentInternalInstance | TableColumnSetupProps,
        [startRowIndex: number, mergedCount: number][]
      >(),
      columnVmMap = useWeakMap<TableColumnSetupProps, ComponentInternalInstance>(),
      getColumnVm = columnVmMap[1];

    const data = computed(() => ensureArray(props.data));
    const [columns, renderColumns] = useCollectorExternalChildren(
      () => props.columns,
      (column, children) =>
        renderElement('table-column', { ...column, /** _ is for internal usage in column */ _: column }, children),
      () => undefined,
      true,
    );
    const maxLevel = () => Math.max(context.state.maxChildLevel, columns.maxChildLevel) + 1,
      all = fComputed(() =>
        (columns.items as (ComponentInternalInstance | TableColumnSetupProps)[]).concat(context.value),
      );
    const context = TableColumnCollector.parent({
      extraProvide: {
        data,
        collapsed,
        cellMerge,
        columnVmMap,
        columns,
        maxLevel,
        all,
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

    const style = fComputed(() => ({
      ...props.rootStyle,
      display: 'grid',
      gridAutoFlow: 'column',
      gridTemplateRows: `repeat(${data.value.length + maxLevel()}, auto)`,
      gridTemplateColumns: all()
        .map((child) => (isCollectedItemLeaf(child) ? toPxIfNum(getProp(child, 'width')) || 'max-content' : ''))
        .join(' '),
    }));

    return () => {
      return (
        <div class={ns.t} part={compParts[0]} style={style()}>
          {renderColumns()}
          <slot></slot>
        </div>
      );
    };
  },
});

export type tTable = typeof Table;
export type TableExpose = {};
export type iTable = InstanceType<tTable> & TableExpose;

export const defineTable = createDefineElement(name, Table, {}, parts, {});
