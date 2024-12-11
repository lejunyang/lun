import { defineSSRCustomElement } from 'custom';
import { createDefineElement, getVmMaxChildLevel, isVmLeafChild } from 'utils';
import { TableColumnSetupProps, tableEmits, tableProps } from './type';
import { useNamespace } from 'hooks';
import { getCompParts } from 'common';
import { TableColumnCollector } from './collector';
import { ensureArray, toPxIfNum } from '@lun-web/utils';
import { fComputed, getVmTreeParent, useStickyTable, useWeakMap, useWeakSet } from '@lun-web/core';
import { ComponentInternalInstance, computed } from 'vue';

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
      cellMerge = useWeakMap<ComponentInternalInstance, [startRowIndex: number, mergedCount: number][]>();
    const maxLevel = fComputed(() => {
      replaceCollapsed();
      let collapseCount = 0;
      return Math.max(
        ...context.value.map((child) => {
          if (--collapseCount > 0) addCollapsed(child);
          else collapseCount = +child.props.headColSpan!;
          return (getVmMaxChildLevel(child) || 0) + 1;
        }),
      );
    });
    const data = computed(() => ensureArray(props.data));
    const context = TableColumnCollector.parent({
      extraProvide: {
        data,
        maxLevel,
        collapsed,
        cellMerge,
      },
    });
    const getSticky = (vm: ComponentInternalInstance) => (vm.props as TableColumnSetupProps).sticky,
      getSelfOrParent = (vm: ComponentInternalInstance | undefined): ReturnType<typeof getSticky> =>
        vm && (getSticky(vm) || getSelfOrParent(getVmTreeParent(vm)));
    useStickyTable(context, getSelfOrParent);

    return () => {
      return (
        <div
          class={ns.t}
          part={compParts[0]}
          style={{
            display: 'grid',
            gridAutoFlow: 'column',
            gridTemplateRows: `repeat(${data.value.length + maxLevel()}, auto)`,
            gridTemplateColumns: context.value
              .map((child) => (isVmLeafChild(child) ? toPxIfNum(child.props.width) || 'max-content' : ''))
              .join(' '),
          }}
        >
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
