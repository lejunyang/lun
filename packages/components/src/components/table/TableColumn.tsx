import { defineSSRCustomElement } from 'custom';
import { createDefineElement, createImportStyle, getHostStyle, getVmLeavesCount, isVmLeafChild } from 'utils';
import { tableColumnEmits, tableColumnProps, TableColumnSetupProps } from './type';
import { useExpose, useNamespace } from 'hooks';
import { getCompParts } from 'common';
import { TableColumnCollector } from './collector';
import { getVmTreeDirectChildren, getVmTreeLevel, useStickyColumn } from '@lun-web/core';
import {
  ComponentInternalInstance,
  CSSProperties,
  getCurrentInstance,
  ref,
  VNodeChild,
  toRaw,
  onBeforeUnmount,
} from 'vue';
import { at, ensureNumber, objectGet, runIfFn } from '@lun-web/utils';

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
      [, getColMergeInfo, setColMergeInfo, deleteColMergeInfo] = cellMerge,
      rawCellMerge = toRaw(cellMerge.value);

    const headCommonProps = {
      class: ns.e('head'),
      part: compParts[1],
    };

    const cells = ref<HTMLElement[]>([]),
      rootHead = ref<HTMLElement>();
    let rowMergedCount = 0,
      currentColMergeInfoIndex = 0,
      mergeWithPrevColCount = 0,
      hasMergedCols = new Set<ComponentInternalInstance>();
    const clean = () => {
      hasMergedCols.forEach((vm) => deleteColMergeInfo(vm));
      hasMergedCols.clear();
    };
    onBeforeUnmount(clean);

    const getStickyStyle = useStickyColumn(rootHead);

    // TODO handle colSpan for nested columns under the same parent
    const updateMergeInfo = (rowIndex: number, colSpan: number, rowSpan: number) => {
      const items = context.getItems();
      colSpan--;
      for (let i = context.index + 1; i < items.length && colSpan > 0; i++) {
        const vm = items[i];
        const mergeInfo = rawCellMerge.get(vm); // get from raw value to avoid it get tracked and then infinite loop
        if (!isVmLeafChild(vm)) continue;
        hasMergedCols.add(vm);
        colSpan--;
        if (mergeInfo) {
          const lastInfo = at(mergeInfo, -1);
          if (lastInfo && rowIndex === lastInfo[0] + lastInfo[1]) lastInfo[1] += rowSpan;
          else mergeInfo.push([rowIndex, rowSpan]);
          setColMergeInfo(vm, [...mergeInfo]);
        } else {
          setColMergeInfo(vm, [[rowIndex, rowSpan]]);
        }
      }
    };

    const getCell = (vm: ComponentInternalInstance, item: any, index: number) => {
      const cellProps = runIfFn(props.cellProps, item, index, props),
        style: CSSProperties = {};
      const mergeInfo = getColMergeInfo(vm)?.[currentColMergeInfoIndex];
      if (mergeInfo?.[0] === index) mergeWithPrevColCount = mergeInfo[1];
      if (--rowMergedCount > 0 || --mergeWithPrevColCount >= 0) {
        style.display = 'none';
        if (!mergeWithPrevColCount) currentColMergeInfoIndex++;
      } else if (cellProps) {
        const { rowSpan, colSpan } = cellProps,
          r = +rowSpan!,
          c = +colSpan!;
        if (r > 1) style.gridRow = `span ${(rowMergedCount = r)}`;
        if (c > 1) {
          style.gridColumn = `span ${c}`;
          updateMergeInfo(index, c, ensureNumber(r, 1));
        }
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
        children.forEach((child) => {
          currentColMergeInfoIndex = 0;
          getContent(child, result);
        });
      }
    };
    return () => {
      if (context.level) return; // only render top level column
      rowMergedCount = 0;
      clean();
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
