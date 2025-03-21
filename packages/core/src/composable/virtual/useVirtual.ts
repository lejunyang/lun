import { computed, reactive, watchEffect } from 'vue';
import { objectComputed, unrefOrGet } from '../../utils';
import {
  at,
  ensureNumber,
  getRect,
  getWindow,
  isElement,
  isFunction,
  isHTMLElement,
  runIfFn,
  ensureArray,
  listenScroll,
  isConnected,
} from '@lun-web/utils';
import { UseVirtualMeasurement, UseVirtualOptions } from './type';
import { calculateRange, getEntryBorderSize, getFurthestMeasurement } from './utils';
import { useCleanUp, useRefMap } from '../../hooks';

// inspired by tanstack/virtual

const observeOption = { box: 'border-box' } as const;

export function useVirtualList(options: UseVirtualOptions) {
  const processedOptions = objectComputed(() => {
    const { lanes, gap, paddingEnd, paddingStart, scrollMargin, items, overscan, disabled, estimatedSize, fixedSize } =
      options;
    const lanesNum = ensureNumber(lanes, 1),
      itemsArr = ensureArray(unrefOrGet(items)),
      overscanArr = ensureArray(runIfFn(overscan, itemsArr, state));
    let temp: number, disable: boolean | undefined;
    if ((disable = (!estimatedSize && !fixedSize) || !itemsArr.length || runIfFn(disabled, itemsArr))) clearKeySize();
    return {
      lanes: lanesNum < 1 ? 1 : lanesNum | 0,
      gap: ensureNumber(gap, 0),
      paddingEnd: ensureNumber(paddingEnd, 0),
      paddingStart: ensureNumber(paddingStart, 0),
      scrollMargin: ensureNumber(scrollMargin, 0),
      items: itemsArr,
      overscan: [(temp = ensureNumber(overscanArr[0], 10)), ensureNumber(overscanArr[1], temp)],
      disabled: disable,
    };
  });

  const keyElementMap = new Map<any, Element>(),
    [getKeySize, setKeySize, , clearKeySize] = useRefMap<any, number>();
  let pendingMeasuredIndex = -1,
    containerEl: HTMLElement;
  const state = reactive({
    scrollOffset: ensureNumber(runIfFn(options.initialScrollOffset), 0),
    scrollAdjustments: 0,
    scrollDirection: null as 'forward' | 'backward' | null,
    forward: false as boolean | null,
    scrolling: false,
    containerSize: +unrefOrGet(options.initialContainerSize)! || 0,
  });

  const getSize = (rect: DOMRect | ResizeObserverSize) =>
    (rect as DOMRect)[options.horizontal ? 'width' : 'height'] ||
    (rect as ResizeObserverSize)[options.horizontal ? 'inlineSize' : 'blockSize'];
  const setContainerSize = (rect: DOMRect | ResizeObserverSize) => {
    state.containerSize = getSize(rect);
  };
  const syncScroll = (behavior?: 'auto' | 'smooth') => {
    containerEl.scrollTo({
      [options.horizontal ? 'left' : 'top']: state.scrollOffset + state.scrollAdjustments,
      behavior,
    });
  };
  const getIndex = (target: Element) => {
    const val = target.getAttribute(options.indexAttribute || 'data-index');
    if (val == null) {
      if (__DEV__) console.error('[useVirtual] Missing index attribute for element', target);
      return -1;
    }
    return +val!;
  };

  const [addClean, cleanUp] = useCleanUp();

  watchEffect(() => {
    cleanUp();
    const { container, observeContainerSize } = options;
    containerEl = unrefOrGet(container)!;
    if (!isHTMLElement(containerEl)) return;
    const targetWin = getWindow(containerEl);

    // TODO scroll to initial position; set scrollOffset
    // syncScroll();

    // -------- scroll --------
    addClean(
      listenScroll(
        containerEl,
        (updateState) => {
          const offset = updateState[options.horizontal ? 'offsetX' : 'offsetY'];
          if (offset === state.scrollOffset) return; // in case horizontal scroll happens in vertical mode
          state.scrollAdjustments = 0;
          state.scrollOffset = offset;
          state.scrolling = updateState.scrolling;
          state.forward = updateState[options.horizontal ? 'xForward' : 'yForward'];
        },
        options,
      ),
    );
    // -------- scroll --------

    // initial container size
    setContainerSize(getRect(containerEl));
    // resize
    if (!observeContainerSize) return;
    const observer = new targetWin.ResizeObserver((entries) => {
      setContainerSize(getEntryBorderSize(entries[0]) || getRect(containerEl));
    });
    observer.observe(containerEl, observeOption);
    addClean(() => observer.disconnect());
  });

  const measurements = computed<UseVirtualMeasurement[]>((old) => {
    old ||= [];
    const { itemKey, fixedSize, estimatedSize } = options;
    const { items, lanes, gap, paddingStart, scrollMargin, disabled } = processedOptions;
    if (disabled) return [];

    let minI = pendingMeasuredIndex > 0 ? pendingMeasuredIndex : 0;
    pendingMeasuredIndex = -1;
    const newMeasurements = old.slice(0, minI--);
    while (++minI < items.length) {
      const item: any = items[minI];
      let key = isFunction(itemKey) ? itemKey(item, minI) : item?.[itemKey!] ?? minI;
      const furtherMeasurement =
        lanes > 1 ? getFurthestMeasurement(options, newMeasurements, minI) : newMeasurements[minI - 1];
      const offsetStart = furtherMeasurement
        ? furtherMeasurement.offsetEnd + ensureNumber(gap, 0)
        : ensureNumber(paddingStart, 0) + ensureNumber(scrollMargin, 0);
      const size = getKeySize(key) ?? +runIfFn(fixedSize || estimatedSize, item, minI)!;
      if (__DEV__ && !(size > 0)) {
        console.error('[useVirtual] Invalid item size for item at index ' + minI + '.');
      }
      newMeasurements[minI] = {
        index: minI,
        item,
        offsetStart,
        offsetEnd: offsetStart + size,
        size,
        key,
        lane: furtherMeasurement ? furtherMeasurement.lane : minI % lanes,
      };
    }
    return newMeasurements;
  });

  const updateItemSize = (index: number, size: number) => {
    const measurement = measurements.value[index];
    if (!measurement) return;
    const itemSize = getKeySize(measurement.key) ?? measurement.size;
    const delta = size - itemSize;
    if (!delta) {
      if (
        runIfFn(options.shouldAdjustScroll, measurement, delta, state) ||
        measurement.offsetStart < state.scrollOffset + state.scrollAdjustments
      ) {
        state.scrollAdjustments += delta;
        syncScroll();
      }
      pendingMeasuredIndex = pendingMeasuredIndex >= 0 ? Math.min(pendingMeasuredIndex, index) : index;
      setKeySize(measurement.key, size);
    }
  };
  const updateMeasure = (el: Element, entry?: ResizeObserverEntry) => {
    const index = getIndex(el);
    const measurement = measurements.value[index];
    if (!measurement) return;
    const { key } = measurement,
      prevEl = keyElementMap.get(key);
    if (el !== prevEl) {
      if (prevEl) itemsObserver?.unobserve(prevEl);
      itemsObserver?.observe(el, observeOption);
      keyElementMap.set(key, el);
    }
    if (isConnected(el)) updateItemSize(index, Math.round(getSize(getEntryBorderSize(entry) || getRect(el))));
  };
  const itemsObserver = options.estimatedSize
    ? new ResizeObserver((entries) => {
        entries.forEach((e) => updateMeasure(e.target, e));
      })
    : null;
  const measureElement = (el?: Element | null) => {
    if (!el) {
      keyElementMap.forEach((el, key) => {
        if (!isConnected(el)) {
          itemsObserver?.unobserve(el);
          keyElementMap.delete(key);
        }
      });
    }
    if (isElement(el)) updateMeasure(el);
  };

  const virtualItems = computed(() => {
    const { items, overscan, disabled, lanes } = processedOptions,
      { customRange } = options,
      { value } = measurements;
    if (disabled) return [];
    const [start, end] = calculateRange(value, state.containerSize, state.scrollOffset);
    const finalStart = Math.max(0, start - overscan[0]),
      // if lanes > 1, need to add extra items
      finalEnd = Math.min(items.length, end + overscan[1] + (lanes - 1)),
      renderMeasurements = value.slice(finalStart, finalEnd);
    return customRange ? customRange(measurements.value, finalStart, finalEnd, renderMeasurements) : renderMeasurements;
  });

  const totalSize = computed(() => {
    const { value } = measurements,
      { paddingStart, lanes, scrollMargin, paddingEnd } = processedOptions;
    let end: number;
    if (!value.length) end = ensureNumber(paddingStart, 0);
    else end = lanes === 1 ? at(value, -1)?.offsetEnd || 0 : Math.max(...value.slice(-lanes).map((v) => v.offsetEnd));
    return end - scrollMargin + paddingEnd;
  });

  const offsets = computed(() => {
    const { value } = virtualItems,
      { scrollMargin } = processedOptions;
    return value.length
      ? [Math.max(0, value[0].offsetStart - scrollMargin), Math.max(0, totalSize.value - at(value, -1)!.offsetEnd)]
      : [0, 0];
  });

  const wrapperStyle = computed(() => {
    const { horizontal, staticPosition } = options;
    const res = {
      position: 'relative' as const,
      [horizontal ? 'width' : 'height']: `${totalSize.value}px`,
    };
    if (staticPosition) {
      const [start] = offsets.value;
      res.transform = `translate3d(${horizontal ? start + 'px,0' : '0,' + start + 'px'},0)`;
    }
    return res;
  });

  return {
    virtualItems,
    measureElement,
    updateItemSize,
    totalSize,
    wrapperStyle,
    offsets,
    state,
    options: processedOptions,
  };
}
