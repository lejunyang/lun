import { defineSSRCustomElement } from 'custom';
import { createDefineElement, createImportStyle, getHostStyle } from 'utils';
import { tableColumnEmits, tableColumnProps } from './type';
import { useNamespace } from 'hooks';
import { getCompParts } from 'common';
import { TableColumnCollector } from './collector';
import { getVmTreeDirectChildren, getVmTreeLevel } from '@lun-web/core';
import { ComponentInternalInstance, getCurrentInstance } from 'vue';
import { ensureArray, objectGet } from '@lun-web/utils';

const name = 'table-column';
const parts = ['root', 'head', 'group'] as const;
const compParts = getCompParts(name, parts);
export const TableColumn = defineSSRCustomElement({
  name,
  props: tableColumnProps,
  emits: tableColumnEmits,
  setup(props) {
    const ns = useNamespace(name);
    const context = TableColumnCollector.child();
    if (!context) throw new Error('Table column must be used inside a table component');
    const vm = getCurrentInstance()!;

    const headCommonProps = {
      class: ns.e('head'),
      part: compParts[1],
    };

    const renderHead = (vm: ComponentInternalInstance) => {
      const children = getVmTreeDirectChildren(vm),
        head = (
          <div {...headCommonProps} style={{}}>
            {vm.props.label}
          </div>
        );
      return children.length ? (
        <div class={ns.em('head-group', 'vertical')} part={compParts[2]}>
          {head}
          <div
            class={ns.em('head-group', 'horizontal')}
            style={{ display: 'grid', gridTemplateColumns: `repeat(${children.length}, 1fr)` }}
          >
            {children.map((child) => renderHead(child))}
          </div>
        </div>
      ) : (
        head
      );
    };
    return () => {
      if (context.level) return; // only render top level column
      return (
        <div class={ns.t} part={compParts[0]} style={{ display: 'contents' }}>
          {renderHead(vm)}
          {ensureArray(context.parent!.props.data).map((item) => (
            // TODO get max level, render deepest column
            <div>{objectGet(item, props.name)}</div>
          ))}
        </div>
      );
    };
  },
});

export type tTableColumn = typeof TableColumn;
export type TableColumnExpose = {};
export type iTableColumn = InstanceType<tTableColumn> & TableColumnExpose;

export const defineTableColumn = createDefineElement(name, TableColumn, {}, parts, {
  common: createImportStyle(name, getHostStyle(`display: contents;`)),
});
