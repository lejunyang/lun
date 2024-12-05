import { defineSSRCustomElement } from 'custom';
import { createDefineElement, createImportStyle, getHostStyle, isVmLeafChild } from 'utils';
import { tableColumnEmits, tableColumnProps, TableColumnSetupProps } from './type';
import { useExpose, useNamespace } from 'hooks';
import { getCompParts } from 'common';
import { TableColumnCollector } from './collector';
import { getVmTreeDirectChildren, getVmTreeLevel } from '@lun-web/core';
import { ComponentInternalInstance, getCurrentInstance } from 'vue';
import { ensureArray, objectGet } from '@lun-web/utils';

const name = 'table-column';
const parts = ['root', 'head', 'group', 'cell'] as const;
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
    useExpose(context);

    const headCommonProps = {
      class: ns.e('head'),
      part: compParts[1],
    };

    const renderHead = (vm: ComponentInternalInstance) => {
      const children = getVmTreeDirectChildren(vm),
        { headColSpan } = vm.props as TableColumnSetupProps,
        level = getVmTreeLevel(vm),
        head = (
          <div
            {...headCommonProps}
            v-show={+headColSpan! !== 0}
            style={{
              gridColumn: !level && +headColSpan! > 1 ? `span ${headColSpan}` : undefined,
            }}
          >
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
    const getLeafVms = (vm: ComponentInternalInstance): ComponentInternalInstance[] => {
      const children = getVmTreeDirectChildren(vm);
      return children.flatMap((child) => (isVmLeafChild(child) ? [child] : getLeafVms(child)));
    };
    const getCell = (vm: ComponentInternalInstance, item: any) => (
      <div class={ns.e('cell')} part={compParts[3]}>
        {objectGet(item, vm.props.name as string)}
      </div>
    );
    return () => {
      if (context.level) return; // only render top level column
      const leafVms = getLeafVms(vm);
      return (
        <div class={ns.t} part={compParts[0]} style={{ display: 'contents' }}>
          {renderHead(vm)}
          {ensureArray(context.parent!.props.data).map((item) =>
            leafVms.length > 1 ? (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${leafVms.length}, 1fr)` }}>
                {leafVms.map((vm) => getCell(vm, item))}
              </div>
            ) : (
              getCell(vm, item)
            ),
          )}
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
