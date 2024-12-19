import { defineSSRCustomElement } from 'custom';
import { createDefineElement, createImportStyle, getHostStyle, getProp, isVm } from 'utils';
import { InternalColumn, tableColumnEmits, tableColumnProps, TableColumnSetupProps } from './type';
import { useExpose, useNamespace } from 'hooks';
import { getCompParts } from 'common';
import { TableColumnCollector } from './collector';
import {
  getCollectedItemIndex,
  getCollectedItemLeavesCount,
  getCollectedItemTreeLevel,
  isCollectedItemInFirstBranch,
  isCollectedItemLeaf,
  useStickyColumn,
  UseVirtualMeasurement,
} from '@lun-web/core';
import {
  CSSProperties,
  getCurrentInstance,
  ref,
  VNodeChild,
  toRaw,
  onBeforeUnmount,
  watchEffect,
  watch,
  computed,
} from 'vue';
import { at, ensureNumber, runIfFn } from '@lun-web/utils';
import { renderCustom } from '../custom-renderer';
import { renderCell } from './TableColumn.renderer';

const name = 'table-column';
const parts = ['root', 'header', 'cell', 'inner-header', 'inner-cell', 'resizer'] as const;
const compParts = getCompParts(name, parts);
export const TableColumn = defineSSRCustomElement({
  name,
  props: tableColumnProps,
  emits: tableColumnEmits,
  setup(props, { attrs }) {
    const ns = useNamespace(name);
    const context = TableColumnCollector.child();
    if (!context) throw new Error(__DEV__ ? 'table-column must be under a lun table element' : '');
    const rootVm = getCurrentInstance()!;
    const getColumn = () => props._ || rootVm;
    useExpose(context);
    const { collapsed, cellMerge, data, columnVmMap, all, virtual, parent } = context,
      [, isCollapsed] = collapsed,
      [, getColMergeInfo, setColMergeInfo, deleteColMergeInfo] = cellMerge,
      [, getColumnVm, setColumnVm] = columnVmMap,
      rawCellMerge = toRaw(cellMerge.value);
    const headerEl = ref<HTMLElement>(),
      cells = ref<HTMLElement[]>([]);
    watchEffect(() => {
      props._ && setColumnVm(props._, rootVm);
    });

    const virtualOn = () => !virtual.options.disabled,
      needMeasureCell = computed(() => isCollectedItemInFirstBranch(getColumn()) && virtualOn());
    watch(
      [needMeasureCell, cells],
      ([need, cells]) => {
        if (need) {
          cells.forEach((cell) => virtual.measureElement(cell));
        }
      },
      { deep: true, flush: 'post' },
    );

    let rowMergedCount = 0,
      currentColMergeInfoIndex = 0,
      mergeWithPrevColCount = 0;
    const hasMergedCols = new Set<InternalColumn>();
    const clean = () => {
      hasMergedCols.forEach((col) => deleteColMergeInfo(col));
      hasMergedCols.clear();
    };
    onBeforeUnmount(clean);

    const [getStickyStyle, stickyContext] = useStickyColumn(),
      [, getStickyType, setHeaderVm, isStickyEnd] = stickyContext!;

    const updateMergeInfo = (rowIndex: number, colIndex: number, colSpan: number, rowSpan: number) => {
      const items = all();
      colSpan--;
      for (let i = colIndex + 1; i < items.length && colSpan > 0; i++) {
        const col = items[i],
          mergeInfo = rawCellMerge.get(col); // get from raw value to avoid it get tracked and then infinite loop
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

    const getCommonStyle = (column: InternalColumn) =>
      ({
        display: 'flex',
        justifyContent: getProp(column, 'justify'),
        alignItems: getProp(column, 'align'),
      } satisfies CSSProperties);

    const getCell = (column: InternalColumn, item: any, rowIndex: number, key?: any) => {
      const { rowSpan, colSpan, innerProps, ...rest } =
          runIfFn(getProp(column, 'cellProps'), item, rowIndex, props) || {},
        cellStyle: CSSProperties = {};
      const mergeInfo = getColMergeInfo(column)?.[currentColMergeInfoIndex];
      let cellShow = 1;
      if (mergeInfo?.[0] === rowIndex) mergeWithPrevColCount = mergeInfo[1];
      if (--rowMergedCount > 0 || --mergeWithPrevColCount >= 0) {
        cellShow = 0;
        if (!mergeWithPrevColCount) currentColMergeInfoIndex++;
      } else if (rowSpan || colSpan) {
        const r = +rowSpan!,
          c = +colSpan!;
        if (r > 1) cellStyle.gridRow = `span ${(rowMergedCount = r)}`;
        if (c > 1) {
          cellStyle.gridColumn = `span ${c}`;
          updateMergeInfo(rowIndex, getCollectedItemIndex(column)!, c, ensureNumber(r, 1));
        }
      }

      const vm = isVm(column) ? column : getColumnVm(column)!,
        stickyType = getStickyType(vm),
        stickyEnd = isStickyEnd(vm);
      return (
        <div
          key={key}
          data-index={rowIndex}
          v-show={cellShow}
          style={{ ...getStickyStyle(vm), ...getCommonStyle(column), ...cellStyle }}
          {...rest}
          class={[ns.e('cell'), ns.is(`sticky-${stickyType}`, stickyType), ns.is('sticky-end', stickyEnd)]}
          part={compParts[2]}
          ref={cells}
          ref_for={true}
        >
          <div {...innerProps} class={[ns.e('inner'), ns.em('inner', 'cell')]} part={compParts[4]}>
            {renderCell(column, rowIndex, item, props)}
          </div>
        </div>
      );
    };

    const resizerPointerEnter = (e: PointerEvent) => {
        context.showResize(e.target as HTMLElement, getColumn());
      },
      resizerStyle = { position: 'absolute' as const, right: 0, insetBlock: 0 };
    const getHead = (column: InternalColumn) => {
      if (parent!.props.noHeader) return;
      const {
          headerColSpan,
          header,
          headerProps: { innerProps, ...rest } = {},
          resizable,
        } = isVm(column) ? (column.props as TableColumnSetupProps) : column,
        level = getCollectedItemTreeLevel(column),
        leavesCount = getCollectedItemLeavesCount(column),
        maxLevel = context.maxLevel(),
        isLeaf = isCollectedItemLeaf(column),
        vm = isVm(column) ? column : getColumnVm(column)!,
        stickyType = getStickyType(vm),
        stickyEnd = isStickyEnd(vm);
      return (
        <div
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
          {...rest}
          class={[
            ns.e('header'),
            ns.is(`sticky-${stickyType}`, stickyType),
            ns.is('sticky-end', stickyEnd),
            ns.is('top-left', !level && !getCollectedItemIndex(column)),
          ]}
          part={compParts[1]}
          v-show={!isCollapsed(column)}
          ref={(el) => {
            headerEl.value = el as HTMLElement;
            setHeaderVm(el as Element, vm); // always set it whether it's a leaf or not. because isLeaf may be incorrect at the start when rendering columns in table's shadow DOM
          }}
        >
          <div {...innerProps} class={[ns.e('inner'), ns.em('inner', 'header')]} part={compParts[3]}>
            {renderCustom(header)}
          </div>
          {isLeaf && resizable && (
            <div
              onPointerenter={resizerPointerEnter}
              class={ns.e('resizer')}
              part={compParts[5]}
              style={resizerStyle}
            ></div>
          )}
        </div>
      );
    };

    const wrap = (children: VNodeChild) => (
      <div class={ns.t} part={compParts[0]} style={{ display: 'contents' }} hidden={attrs.hidden as any}>
        {children}
        <slot></slot>
      </div>
    );

    return () => {
      const column = getColumn();
      // if it's not a leaf column, it should be a column with nested children, only render its header
      if (!isCollectedItemLeaf(column)) return wrap(getHead(column));
      rowMergedCount = 0;
      clean();
      return wrap([
        getHead(column),
        ...data().map((item, i) =>
          virtualOn()
            ? getCell(
                column,
                (item as UseVirtualMeasurement).item,
                (item as UseVirtualMeasurement).index,
                (item as UseVirtualMeasurement).key,
              )
            : getCell(column, item, i),
        ),
      ]);
    };
  },
});

export type tTableColumn = typeof TableColumn;
export type TableColumnExpose = {};
export type iTableColumn = InstanceType<tTableColumn> & TableColumnExpose;

export const defineTableColumn = createDefineElement(name, TableColumn, {}, parts, {
  common: createImportStyle(name, getHostStyle(`display: contents;`)),
});
