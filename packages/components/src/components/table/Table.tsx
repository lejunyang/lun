import { defineSSRCustomElement } from 'custom';
import { createDefineElement, getVmMaxChildLevel } from 'utils';
import { TableColumnSetupProps, tableEmits, tableProps } from './type';
import { useNamespace } from 'hooks';
import { getCompParts } from 'common';
import { TableColumnCollector } from './collector';
import { ensureArray } from '@lun-web/utils';
import { fComputed, useStickyTable, useWeakSet } from '@lun-web/core';

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
      [replaceCollapsed, , addCollapsed] = collapsed;
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
    const context = TableColumnCollector.parent({
      extraProvide: {
        maxLevel,
        collapsed,
      },
    });
    useStickyTable(context, (vm) => (vm.props as TableColumnSetupProps).sticky);

    return () => {
      return (
        <div
          class={ns.t}
          part={compParts[0]}
          style={{
            display: 'grid',
            gridAutoFlow: 'column',
            gridTemplateRows: `repeat(${ensureArray(props.data).length + maxLevel()}, auto)`,
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
