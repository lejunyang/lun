import { defineCustomElement } from 'custom';
import { createDefineElement, createImportStyle, getHostStyle } from 'utils';
import { tableColumnEmits, tableColumnProps, TableColumnSetupProps } from './type';
import { useExpose, useNamespace } from 'hooks';
import { ElementWithExpose, getCompParts } from 'common';
import { TableColumnCollector, toExternalContext } from './collector';
import {
  fComputed,
  getCollectedItemIndex,
  getCollectedItemLeavesCount,
  getCollectedItemTreeLevel,
  InstanceWithProps,
  isCollectedItemInFirstBranch,
  isCollectedItemLeaf,
  useStickyColumn,
} from '@lun-web/core';
import { CSSProperties, getCurrentInstance, ref, VNodeChild, toRaw, onBeforeUnmount, watch, computed } from 'vue';
import { at, ensureNumber, runIfFn } from '@lun-web/utils';
import { renderCustom } from '../custom-renderer';
import { renderCell } from './TableColumn.renderer';
import useColumnActions from './table-column.actions';
import { InternalColumn } from './internalType';

const name = 'table-column';
const parts = ['root', 'header', 'cell', 'inner-header', 'inner-cell', 'resizer'] as const;
const compParts = getCompParts(name, parts);
export const TableColumn = defineCustomElement({
  name,
  props: tableColumnProps,
  emits: tableColumnEmits,
  setup(props) {
    const ns = useNamespace(name);
    const context = TableColumnCollector.child();
    if (!context) throw new Error(__DEV__ ? 'table-column must be under a lun table element' : '');
    const rootVm = getCurrentInstance() as InstanceWithProps<TableColumnSetupProps>;
    useExpose(context);
    const { collapsed, cellMerge, data, all, virtual, parent } = context,
      [getColMergeInfo, setColMergeInfo, deleteColMergeInfo] = cellMerge,
      rawCellMerge = toRaw(cellMerge.value);
    const isCollapsed = fComputed(() => collapsed[0](rootVm));
    const externalContext = toExternalContext(context);
    const headerEl = ref<HTMLElement>(),
      cells = ref<HTMLElement[]>([]);

    const virtualOn = () => !virtual.options.disabled,
      needMeasureCell = computed(() => isCollectedItemInFirstBranch(rootVm) && virtualOn());
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

    const getCommonStyle = () =>
      ({
        display: 'flex',
        justifyContent: props.justify,
        alignItems: props.align,
      } satisfies CSSProperties);

    const getCell = (item: any, rowIndex: number, key: any, renderIndex: number) => {
      const { rowSpan, colSpan, innerProps, ...rest } = runIfFn(props.cellProps, item, rowIndex, props) || {},
        cellStyle: CSSProperties = {};
      const mergeInfo = getColMergeInfo(rootVm)?.[currentColMergeInfoIndex];
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
          updateMergeInfo(rowIndex, getCollectedItemIndex(rootVm)!, c, ensureNumber(r, 1));
        }
      }

      const stickyType = getStickyType(rootVm),
        stickyEnd = isStickyEnd(rootVm);
      return (
        <div
          key={key}
          aria-rowindex={rowIndex + 1}
          role="cell"
          data-index={rowIndex}
          data-render-index={renderIndex}
          v-show={cellShow}
          style={{ ...getStickyStyle(rootVm), ...getCommonStyle(), ...cellStyle }}
          {...rest}
          class={[ns.e('cell'), ns.is(`sticky-${stickyType}`, stickyType), ns.is('sticky-end', stickyEnd)]}
          part={compParts[2]}
          ref={cells}
          ref_for={true}
        >
          <div {...innerProps} class={[ns.e('inner'), ns.em('inner', 'cell')]} part={compParts[4]}>
            {renderCell(rootVm, rowIndex, key, item, props, externalContext)}
          </div>
        </div>
      );
    };

    const resizerPointerEnter = (e: PointerEvent) => {
        context.showResize(e.target as HTMLElement, rootVm);
      },
      resizerStyle = { position: 'absolute' as const, right: 0, insetBlock: 0 };
    const getHead = () => {
      if (parent!.props.noHeader) return;
      const { headerColSpan, header, headerProps: { innerProps, ...rest } = {}, resizable } = props,
        level = getCollectedItemTreeLevel(rootVm),
        leavesCount = getCollectedItemLeavesCount(rootVm),
        maxLevel = context.maxLevel(),
        isLeaf = isCollectedItemLeaf(rootVm),
        stickyType = getStickyType(rootVm),
        stickyEnd = isStickyEnd(rootVm);
      return (
        <div
          role="columnheader"
          style={{
            ...getStickyStyle(rootVm),
            ...getCommonStyle(),
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
            // ns.is('top-left', !level && !getCollectedItemIndex(column)), // FIXME fix index to fix this for mix prop columns and children columns
          ]}
          part={compParts[1]}
          v-show={!isCollapsed()}
          ref={(el) => {
            headerEl.value = el as HTMLElement;
            setHeaderVm(el as Element, rootVm); // always set it whether it's a leaf or not. because isLeaf may be incorrect at the start when rendering columns in table's shadow DOM
          }}
        >
          <div {...innerProps} class={[ns.e('inner'), ns.em('inner', 'header')]} part={compParts[3]}>
            {renderCustom(runIfFn(header, { props, context: externalContext, data: data() }))}
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

    const handlers = useColumnActions(() => rootVm, context);

    const wrap = (children: VNodeChild) => (
      <div class={ns.t} part={compParts[0]} style={{ display: 'contents' }} hidden={props.hidden} {...handlers}>
        {children}
        <slot></slot>
      </div>
    );

    return () => {
      if (!context.state.waitDone) return;
      const isLeaf = isCollectedItemLeaf(rootVm);
      // if it's not a leaf column, it should be a column with nested children, only render its header
      if (!isLeaf) return wrap(getHead());
      rowMergedCount = 0;
      clean();
      return wrap([getHead(), ...data().map(([row, i, key], renderIndex) => getCell(row, i, key, renderIndex))]);
    };
  },
});

export type TableColumnExpose = {};
export type tTableColumn = ElementWithExpose<typeof TableColumn, TableColumnExpose>;
export type iTableColumn = InstanceType<tTableColumn>;

export const defineTableColumn = createDefineElement(name, TableColumn, {}, parts, [
  createImportStyle(name, getHostStyle(`display: contents;`)),
]);
