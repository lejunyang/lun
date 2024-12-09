import { defineSSRCustomElement } from 'custom';
import { createDefineElement, createImportStyle, getHostStyle, getVmLeavesCount, isVmLeafChild } from 'utils';
import { tableColumnEmits, tableColumnProps, TableColumnSetupProps } from './type';
import { useExpose, useNamespace } from 'hooks';
import { getCompParts } from 'common';
import { TableColumnCollector } from './collector';
import { getVmTreeDirectChildren, getVmTreeLevel, useStickyColumn } from '@lun-web/core';
import { ComponentInternalInstance, CSSProperties, getCurrentInstance, ref, VNodeChild } from 'vue';
import { objectGet, runIfFn } from '@lun-web/utils';

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
    const { collapsed, cellMerge, data } = context,
      [, isCollapsed] = collapsed,
      [, getCellMergeInfo, setCellMergeInfo] = cellMerge;

    const headCommonProps = {
      class: ns.e('head'),
      part: compParts[1],
    };

    const cells = ref<HTMLElement[]>([]),
      rootHead = ref<HTMLElement>();
    let rowMergedCount = 0;

    const getStickyStyle = useStickyColumn(rootHead);

    const getCell = (vm: ComponentInternalInstance, item: any, index: number) => {
      const cellProps = runIfFn(props.cellProps, item, index, props),
        style: CSSProperties = {};
      if (--rowMergedCount > 0) {
        style.display = 'none';
      } else if (cellProps) {
        const { rowSpan, colSpan } = cellProps;
        if (rowSpan > 1) style.gridRow = `span ${(rowMergedCount = rowSpan)}`;
      }
      return (
        <div
          class={ns.e('cell')}
          part={compParts[3]}
          ref={cells}
          ref_for={true}
          style={{ ...getStickyStyle(), ...style }}
        >
          {objectGet(item, vm.props.name as string)}
        </div>
      );
    };
    const getHead = (vm: ComponentInternalInstance) => {
      const { headColSpan } = vm.props as TableColumnSetupProps,
        level = getVmTreeLevel(vm),
        leavesCount = getVmLeavesCount(vm),
        maxLevel = context.maxLevel();
      return (
        <div
          {...headCommonProps}
          v-show={!isCollapsed(vm)}
          ref={level === 0 ? rootHead : undefined}
          style={{
            ...getStickyStyle(),
            gridColumn:
              /**
               * leavesCount > 1: having multiple nested children columns
               * !level && +headColSpan! > 1: colspan is set for root column head
               */
              leavesCount > 1 || (!level && +headColSpan! > 1) ? `span ${leavesCount || headColSpan}` : undefined,
            // leavesCount < value: other columns have nested columns, current column head needs also to be expanded
            gridRow: !level && leavesCount < maxLevel ? `span ${maxLevel}` : undefined,
          }}
        >
          {vm.props.label}
        </div>
      );
    };
    const getContent = (vm: ComponentInternalInstance, result: VNodeChild[]) => {
      const children = getVmTreeDirectChildren(vm),
        isLeaf = isVmLeafChild(vm);
      result.push(getHead(vm));
      if (isLeaf) {
        result.push(...data.value.map((item, i) => getCell(vm, item, i)));
      } else {
        children.forEach((child) => getContent(child, result));
      }
    };
    return () => {
      if (context.level) return; // only render top level column
      rowMergedCount = 0;
      const info = getCellMergeInfo(vm);
      const content: VNodeChild[] = [];
      getContent(vm, content);
      return (
        <div class={ns.t} part={compParts[0]} style={{ display: 'contents' }}>
          {content}
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
