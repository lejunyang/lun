import { defineSSRCustomElement } from 'custom';
import { createDefineElement, createImportStyle, getHostStyle, getProp, isVm } from 'utils';
import { tableColumnEmits, tableColumnProps, TableColumnSetupProps } from './type';
import { useExpose, useNamespace } from 'hooks';
import { getCompParts } from 'common';
import { TableColumnCollector } from './collector';
import {
  getCollectedItemIndex,
  getCollectedItemLeavesCount,
  getCollectedItemTreeChildren,
  getCollectedItemTreeLevel,
  isCollectedItemLeaf,
  useStickyColumn,
} from '@lun-web/core';
import {
  ComponentInternalInstance,
  CSSProperties,
  getCurrentInstance,
  ref,
  VNodeChild,
  toRaw,
  onBeforeUnmount,
  watchEffect,
} from 'vue';
import { at, ensureNumber, objectGet, runIfFn } from '@lun-web/utils';

const name = 'table-column';
const parts = ['root', 'header', 'cell'] as const;
const compParts = getCompParts(name, parts);
export const TableColumn = defineSSRCustomElement({
  name,
  props: tableColumnProps,
  emits: tableColumnEmits,
  setup(props) {
    const ns = useNamespace(name);
    const context = TableColumnCollector.child();
    if (!context) throw new Error('Table column must be used inside a table component');
    const rootVm = getCurrentInstance()!;
    useExpose(context);
    const { collapsed, cellMerge, data, columnVmMap } = context,
      [, isCollapsed] = collapsed,
      [, getColMergeInfo, setColMergeInfo, deleteColMergeInfo] = cellMerge,
      [, getColumnVm, setColumnVm] = columnVmMap,
      rawCellMerge = toRaw(cellMerge.value);
    watchEffect(() => {
      props._ && setColumnVm(props._, rootVm);
    });

    const headCommonProps = {
      class: ns.e('header'),
      part: compParts[1],
    };

    const cells = ref<HTMLElement[]>([]);
    let rowMergedCount = 0,
      currentColMergeInfoIndex = 0,
      mergeWithPrevColCount = 0;
    const hasMergedCols = new Set<ComponentInternalInstance | TableColumnSetupProps>();
    const clean = () => {
      hasMergedCols.forEach((col) => deleteColMergeInfo(col));
      hasMergedCols.clear();
    };
    onBeforeUnmount(clean);

    const [getStickyStyle, stickyContext] = useStickyColumn(),
      [, getStickyType, setHeaderVm, isStickyEnd] = stickyContext!;

    // TODO handle colSpan for nested columns under the same parent
    const updateMergeInfo = (rowIndex: number, colIndex: number, colSpan: number, rowSpan: number) => {
      const items = (context.columns.items as (TableColumnSetupProps | ComponentInternalInstance)[]).concat(
        context.getItems(),
      );
      colSpan--;
      for (let i = colIndex + 1; i < items.length && colSpan > 0; i++) {
        const col = items[i];
        const mergeInfo = rawCellMerge.get(col); // get from raw value to avoid it get tracked and then infinite loop
        if (!isCollectedItemLeaf(col)) return;
        hasMergedCols.add(col);
        colSpan--;
        if (mergeInfo) {
          const lastInfo = at(mergeInfo, -1);
          if (lastInfo && rowIndex === lastInfo[0] + lastInfo[1]) lastInfo[1] += rowSpan;
          else mergeInfo.push([rowIndex, rowSpan]);
          setColMergeInfo(col, [...mergeInfo]);
        } else {
          setColMergeInfo(col, [[rowIndex, rowSpan]]);
        }
      }
    };

    const getCommonStyle = (column: ComponentInternalInstance | TableColumnSetupProps) =>
      ({ textAlign: getProp(column, 'align') } satisfies CSSProperties);

    const getCell = (column: ComponentInternalInstance | TableColumnSetupProps, item: any, rowIndex: number) => {
      const cellProps = runIfFn(getProp(column, 'cellProps'), item, rowIndex, props),
        style: CSSProperties = {};
      const mergeInfo = getColMergeInfo(column)?.[currentColMergeInfoIndex];
      if (mergeInfo?.[0] === rowIndex) mergeWithPrevColCount = mergeInfo[1];
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
          updateMergeInfo(rowIndex, getCollectedItemIndex(column)!, c, ensureNumber(r, 1));
        }
      }

      const vm = isVm(column) ? column : getColumnVm(column)!,
        stickyType = getStickyType(vm),
        stickyEnd = isStickyEnd(vm);
      return (
        <div
          class={[ns.e('cell'), ns.is(`sticky-${stickyType}`, stickyType), ns.is('sticky-end', stickyEnd)]}
          part={compParts[2]}
          ref={cells}
          ref_for={true}
          style={{ ...getStickyStyle(vm), ...style, ...getCommonStyle(column) }}
        >
          {objectGet(item, getProp(column, 'name'))}
        </div>
      );
    };
    const getHead = (column: TableColumnSetupProps | ComponentInternalInstance) => {
      const { headerColSpan, label } = isVm(column) ? (column.props as TableColumnSetupProps) : column,
        level = getCollectedItemTreeLevel(column),
        leavesCount = getCollectedItemLeavesCount(column),
        maxLevel = context.maxLevel(),
        isLeaf = isCollectedItemLeaf(column),
        vm = isVm(column) ? column : getColumnVm(column)!,
        stickyType = getStickyType(vm),
        stickyEnd = isStickyEnd(vm);
      return (
        <div
          {...headCommonProps}
          class={[ns.is(`sticky-${stickyType}`, stickyType), ns.is('sticky-end', stickyEnd)]}
          v-show={!isCollapsed(column)}
          ref={(el) => {
            setHeaderVm(el as Element, vm); // always set it whether it's a leaf or not. because isLeaf may be incorrect at the start when rendering columns in table's shadow DOM
          }}
          style={{
            ...getStickyStyle(vm),
            ...getCommonStyle(column),
            gridColumn:
              /**
               * leavesCount > 1: having multiple nested children columns
               * isLeaf && !level && +headerColSpan! > 1: colspan is set for root column header
               */
              leavesCount > 1 || (isLeaf && !level && +headerColSpan! > 1)
                ? `span ${leavesCount || headerColSpan}`
                : undefined,
            // leavesCount < value: other columns have nested columns, current column header needs also to be expanded
            gridRow: !level && leavesCount < maxLevel ? `span ${maxLevel}` : undefined,
          }}
        >
          {label}
        </div>
      );
    };
    const getContent = (column: TableColumnSetupProps | ComponentInternalInstance, result: VNodeChild[]) => {
      const children = getCollectedItemTreeChildren(column) as (TableColumnSetupProps | ComponentInternalInstance)[],
        isLeaf = isCollectedItemLeaf(column);
      result.push(getHead(column));
      if (isLeaf) {
        result.push(...data.value.map((item, i) => getCell(column, item, i)));
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
      getContent(props._ || rootVm, content);
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
