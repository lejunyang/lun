import { computed, reactive, watchEffect, setBlockTracking } from 'vue';
import { unrefOrGet } from '../../utils';
import {
  AnyFn,
  debounce,
  ensureNumber,
  getCachedComputedStyle,
  getRect,
  getWindow,
  isArray,
  isElement,
  isFunction,
  isHTMLElement,
  isSupportScrollEnd,
  on,
  runIfFn,
  toArrayIfNotNil,
} from '@lun/utils';
import { UseVirtualMeasurement, UseVirtualOptions } from './type';
import { calculateRange, getEntryBorderSize, getFurthestMeasurement } from './utils';
import { tryOnScopeDispose } from '../../hooks';

// inspired by tanstack/virtual

const listenOption = { passive: true };

export function useVirtual(options: UseVirtualOptions) {
  const keyElementMap = new Map<any, Element>(),
    keySizeMap = reactive(new Map<any, number>());
  let pendingMeasuredIndex = -1,
    isRTL = false,
    containerEl: HTMLElement;
  const state = reactive({
    scrollOffset: ensureNumber(runIfFn(options.initialScrollOffset), 0),
    scrollAdjustments: 0,
    scrollDirection: null as 'forward' | 'backward' | null,
    scrolling: false,
    containerSize: unrefOrGet(options.initialContainerSize) || 0,
  });

  const getSize = (rect: DOMRect | ResizeObserverSize) =>
    (rect as DOMRect)[options.horizontal ? 'width' : 'height'] ||
    (rect as ResizeObserverSize)[options.horizontal ? 'inlineSize' : 'blockSize'];
  const setContainerSize = (rect: DOMRect | ResizeObserverSize) => {
    state.containerSize = getSize(rect);
  };
  const updateScroll = (offset: number, isScrolling: boolean) => {
    state.scrollAdjustments = 0;
    state.scrollDirection = isScrolling ? (state.scrollOffset < offset ? 'forward' : 'backward') : null;
    state.scrollOffset = offset;
    state.scrolling = isScrolling;
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

  let cleanFns: AnyFn[] = [];
  const clean = () => {
    cleanFns.forEach((f) => f());
    cleanFns = [];
  };
  tryOnScopeDispose(clean);

  watchEffect(() => {
    clean();
    const { container, observeContainerSize } = options;
    containerEl = unrefOrGet(container)!;
    if (!isHTMLElement(containerEl)) return;
    isRTL = getCachedComputedStyle(containerEl).direction === 'rtl';
    const targetWin = getWindow(containerEl);

    // TODO scroll to initial position
    // syncScroll();

    // -------- scroll --------
    let scrollEndDebounce: AnyFn;
    const updateOffset = (scrolling = false) =>
      updateScroll(
        // when it's RTL, scrollLeft is negative
        options.horizontal ? containerEl.scrollLeft * (isRTL ? -1 : 1) : containerEl.scrollTop,
        scrolling,
      );
    isSupportScrollEnd()
      ? cleanFns.push(on(containerEl, 'scrollend', () => updateOffset(), listenOption))
      : (scrollEndDebounce = debounce(() => updateOffset(), options.scrollEndDelay || 150));
    cleanFns.push(
      on(
        containerEl,
        'scroll',
        () => {
          updateOffset(true);
          scrollEndDebounce?.();
        },
        listenOption,
      ),
    );
    // update initial scroll offset
    updateOffset();
    // -------- scroll --------

    // initial container size
    setContainerSize(getRect(containerEl));
    // resize
    if (!observeContainerSize) return;
    const observer = new targetWin.ResizeObserver((entries) => {
      setContainerSize(getEntryBorderSize(entries[0]) || getRect(containerEl));
    });
    observer.observe(containerEl, { box: 'border-box' });
    cleanFns.push(() => observer.disconnect());
  });

  const measurements = computed<UseVirtualMeasurement[]>((old) => {
    old ||= [];
    const { items, itemKey, fixedSize, estimatedSize, disabled, lanes, gap, paddingStart, scrollMargin } = options;
    const lanesNum = ensureNumber(lanes, 1);
    const itemsArr = unrefOrGet(items);
    if (!isArray(itemsArr) || runIfFn(disabled, itemsArr)) {
      setBlockTracking(-1);
      keySizeMap.clear();
      setBlockTracking(1);
      return [];
    }

    let minI = pendingMeasuredIndex > 0 ? pendingMeasuredIndex : 0;
    pendingMeasuredIndex = -1;
    const newMeasurements = old.slice(0, minI--);
    while (++minI < itemsArr.length) {
      const item: any = itemsArr[minI];
      let key = isFunction(itemKey) ? itemKey(item, minI) : item?.[itemKey];
      if (__DEV__ && key == null) {
        key = minI;
        console.error('[useVirtual] Missing key for item at index ' + minI + '.');
      }
      const furtherMeasurement = lanesNum > 1 ? getFurthestMeasurement(options, old, minI) : old[minI - 1];
      const offsetStart = furtherMeasurement
        ? furtherMeasurement.offsetEnd + ensureNumber(gap, 0)
        : ensureNumber(paddingStart, 0) + ensureNumber(scrollMargin, 0);
      const size = keySizeMap.get(key) ?? runIfFn(fixedSize || estimatedSize, item, minI);
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
        lane: furtherMeasurement ? furtherMeasurement.lane : minI % lanesNum,
      };
    }
    return newMeasurements;
  });

  const updateItemSize = (index: number, size: number) => {
    const measurement = measurements.value[index];
    if (!measurement) return;
    const itemSize = keySizeMap.get(measurement.key) ?? measurement.size;
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
      keySizeMap.set(measurement.key, size);
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
      itemsObserver?.observe(el);
      keyElementMap.set(key, el);
    }
    if (el.isConnected) updateItemSize(index, Math.round(getSize(getEntryBorderSize(entry) || getRect(el))));
  };
  const itemsObserver = options.observeItemSize
    ? new ResizeObserver((entries) => {
        entries.forEach((e) => updateMeasure(e.target, e));
      })
    : null;
  const measureElement = (el?: Element | null) => {
    if (!el) {
      keyElementMap.forEach((el, key) => {
        if (!el.isConnected) {
          itemsObserver?.unobserve(el);
          keyElementMap.delete(key);
        }
      });
    }
    if (isElement(el)) updateMeasure(el);
  };

  const virtualItems = computed(() => {
    const { items, disabled, overscan } = options;
    const itemsArr = unrefOrGet(items),
      overscanArr = toArrayIfNotNil(runIfFn(overscan, itemsArr, state));
    overscanArr[0] = ensureNumber(overscanArr[0], 10);
    overscanArr[1] = ensureNumber(overscanArr[1], overscanArr[0]);
    if (!isArray(itemsArr) || runIfFn(disabled, itemsArr)) return [];
    const [start, end] = calculateRange(measurements.value, state.containerSize, state.scrollOffset);
    const finalStart = Math.max(0, start - overscanArr[0]),
      finalEnd = Math.min(itemsArr.length, end + overscanArr[1]);
    return measurements.value.slice(finalStart, finalEnd);
  });

  return {
    virtualItems,
    measureElement,
    updateItemSize,
  };
}
