import { defineSSRCustomElement } from 'custom';
import { createDefineElement, getVmMaxChildLevel } from 'utils';
import { tableEmits, tableProps } from './type';
import { useNamespace } from 'hooks';
import { getCompParts } from 'common';
import { TableColumnCollector } from './collector';
import { ensureArray } from '@lun-web/utils';
import { fComputed } from '@lun-web/core';

const name = 'table';
const parts = ['root'] as const;
const compParts = getCompParts(name, parts);
export const Table = defineSSRCustomElement({
  name,
  props: tableProps,
  emits: tableEmits,
  setup(props) {
    const ns = useNamespace(name);
    const maxLevel = fComputed(() => Math.max(...context.value.map((child) => (getVmMaxChildLevel(child) || 0) + 1)));
    const context = TableColumnCollector.parent({
      extraProvide: {
        maxLevel,
      },
    });

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
