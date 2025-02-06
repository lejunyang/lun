import { defineCustomElement } from 'custom';
import { createDefineElement, getProp, renderElement } from 'utils';
import { TableColumnSetupProps, tableEmits, tableProps } from './type';
import { useCE, useNamespace, useValueModel, useValueSet, usePropChildrenRender } from 'hooks';
import { ElementWithExpose, getCompParts } from 'common';
import { TableColumnCollector, TableState } from './collector';
import { arrayFrom, ensureArray, ensureNumber, ensureTruthyArray, isEmpty, runIfFn, toPxIfNum } from '@lun-web/utils';
import {
  getCollectedItemTreeLevel,
  getCollectedItemTreeParent,
  isCollectedItemLeaf,
  useStickyTable,
  useRefWeakMap,
  useRefWeakSet,
  fComputed,
  useVirtualList,
  useSelectMethods,
  useShallowRefSet,
  useShallowRefMap,
  useInlineStyle,
} from '@lun-web/core';
import {
  ComponentInternalInstance,
  computed,
  onBeforeUnmount,
  ref,
  shallowReactive,
  shallowRef,
  watchEffect,
} from 'vue';
import useColumnResizer from './Table.ColumnResizer';
import useRowExpand from './Table.RowExpand';
import { getRowKey } from './utils';
import { defineTableColumn } from './TableColumn';
import { InternalColumn, InternalRowInfo } from './internalType';
import { TABLE_CHECKBOX_SELECT_COLUMN, TABLE_INDEX_COLUMN, TABLE_RADIO_SELECT_COLUMN } from './TableColumn.renderer';

const name = 'table';
const parts = ['root', 'virtual-wrapper', 'expanded-content', 'resizer'] as const;
const compParts = getCompParts(name, parts);
export const Table = defineCustomElement({
  name,
  props: tableProps,
  emits: tableEmits,
  setup(props) {
    const ns = useNamespace(name);
    const ce = useCE(),
      rootEl = ref<HTMLElement>();
    const collapsed = useRefWeakSet(),
      [, addCollapsed, , replaceCollapsed] = collapsed,
      cellMerge = useRefWeakMap<InternalColumn, [startRowIndex: number, mergedCount: number][]>(),
      [getColumnWidth, setColumnWidth] = useRefWeakMap<InternalColumn, number>();

    const state = shallowReactive({
      hoveringIndex: null,
    }) as TableState;

    // ---data and key process---
    const keySet = useShallowRefSet(),
      [, addKey, , replaceKeySet] = keySet,
      [, setKeyData, , replaceKeyData] = useShallowRefMap(),
      data = shallowRef([] as InternalRowInfo[]);
    onBeforeUnmount(replaceKeySet);
    onBeforeUnmount(replaceKeyData);
    watchEffect(() => {
      replaceKeySet();
      replaceKeyData();
      data.value = ensureArray(props.data).map((item, index) => {
        const key = getRowKey(props, item, index);
        addKey(key);
        setKeyData(key, item);
        return [item, index, key];
      });
    });
    // ---data and key process---

    // ---row selection---
    const selectModel = useValueModel(props, {
        key: 'selected',
        hasRaw: true,
        eventName: 'select',
      }),
      multiple = () => props.selectionMode === 'multiple',
      selectedSet = useValueSet(selectModel, multiple);
    const select = useSelectMethods({
      multiple,
      watchState: true,
      current: selectedSet,
      allValues: keySet,
      onChange: (param) => {
        selectModel.value = param as any;
      },
    });
    // ---row selection---

    // ---prop `columns` process---
    const propColumns = fComputed(() => {
      const { columns, indexColumn, selectColumn } = props;
      const predefined = ensureTruthyArray([
        selectColumn
          ? {
              ...(multiple() ? TABLE_CHECKBOX_SELECT_COLUMN : TABLE_RADIO_SELECT_COLUMN),
              ...(selectColumn as any),
            }
          : 0,
        indexColumn ? { ...TABLE_INDEX_COLUMN, ...(indexColumn as any) } : 0,
      ]);
      return isEmpty(predefined) ? columns : predefined.concat(columns);
    });
    const renderColumns = usePropChildrenRender(
      propColumns,
      (column, children) => renderElement('table-column', column, children),
      1,
      () => props.columnPropsMap,
    );
    // ---prop `columns` process---

    const [renderResizer, showResize] = useColumnResizer(setColumnWidth);

    const maxLevel = () => context.state.maxChildLevel + 1,
      all = fComputed(() => context.value);

    // ---virtual renderer---
    const virtualOff = () => !props.virtual,
      virtual = useVirtualList({
        items: data,
        itemKey: (item) => item[2],
        container: ce,
        observeContainerSize: true,
        disabled: virtualOff,
        estimatedSize: (item, index) => {
          const height = runIfFn(props.rowHeight, item[0], index);
          return ensureNumber(height, 44);
        },
        staticPosition: true,
      }),
      virtualData = fComputed(() =>
        virtualOff() ? data.value : virtual.virtualItems.value.map((v) => v.item as InternalRowInfo),
      );
    // ---virtual renderer---

    // ---row expansion---
    const [renderExpand, getExpandRowHeight, rowExpand] = useRowExpand(props, virtualData, maxLevel);
    // ---row expansion---

    const context = TableColumnCollector.parent({
      extraProvide: {
        collapsed,
        cellMerge,
        maxLevel,
        all,
        showResize,
        virtual,
        data: virtualData,
        rowExpand,
        state,
        select,
      },
    });

    // preprocess headerColSpan
    watchEffect(() => {
      if (!context.state.waitDone) return;
      replaceCollapsed();
      let collapseCount = 0;
      all().forEach((child) => {
        if (!isCollectedItemLeaf(child) || getCollectedItemTreeLevel(child)! > 0) return (collapseCount = 0);
        if (--collapseCount > 0) addCollapsed(child);
        else collapseCount = +getProp(child, 'headerColSpan')!;
      });
    });

    // ---sticky columns---
    const getSticky = (vm: ComponentInternalInstance) =>
        (vm.props as TableColumnSetupProps).sticky as 'left' | 'right' | undefined,
      getSelfOrParent = (vm: ComponentInternalInstance | undefined): ReturnType<typeof getSticky> =>
        vm && (getSticky(vm) || getSelfOrParent(getCollectedItemTreeParent(vm) as ComponentInternalInstance));
    useStickyTable(() => context.value, getSelfOrParent);
    // ---sticky columns---

    const gridTemplateRows = fComputed(() =>
        [
          ...(props.noHeader ? [] : arrayFrom(maxLevel(), () => toPxIfNum(props.headerHeight) || 'auto')),
          ...virtualData().map(
            ([row, i]) => (toPxIfNum(runIfFn(props.rowHeight, row, i)) || 'auto') + getExpandRowHeight(row, i),
          ),
        ].join(' '),
      ),
      gridTemplateColumns = fComputed(() =>
        all()
          .map((child) =>
            isCollectedItemLeaf(child) && !getProp(child, 'hidden')
              ? toPxIfNum(getColumnWidth(child) ?? getProp(child, 'width')) || 'max-content'
              : '',
          )
          .join(' '),
      );
    useInlineStyle(
      rootEl,
      computed(() => ({
        ...props.rootStyle,
        display: 'grid',
        grid: gridTemplateRows() + '/' + gridTemplateColumns(),
        gridAutoFlow: 'column',
      })),
    );

    return () => {
      const node = (
        <div class={ns.t} part={compParts[0]} ref={rootEl}>
          {renderExpand({
            class: ns.e('expanded-content'),
            part: compParts[2],
          })}
          {renderColumns()}
          <slot></slot>
          {renderResizer({
            class: ns.e('resizer'),
            part: compParts[3],
          })}
        </div>
      );
      return virtualOff() ? (
        node
      ) : (
        <div style={virtual.wrapperStyle.value} part={compParts[1]}>
          {node}
        </div>
      );
    };
  },
});

export type TableExpose = {};
export type tTable = ElementWithExpose<typeof Table, TableExpose>;
export type iTable = InstanceType<tTable>;

export const defineTable = createDefineElement(name, Table, {}, parts, [defineTableColumn]);
