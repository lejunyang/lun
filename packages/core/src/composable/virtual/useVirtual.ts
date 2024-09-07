import { computed, reactive, watchEffect, setBlockTracking } from 'vue';
import { unrefOrGet } from '../../utils';
import {
  AnyFn,
  ensureNumber,
  getRect,
  getWindow,
  isArray,
  isElement,
  isFunction,
  isHTMLElement,
  isSupportScrollEnd,
  on,
  runIfFn,
} from '@lun/utils';
import { UseVirtualMeasurement, UseVirtualOptions } from './type';
import { calculateRange, getFurthestMeasurement } from './utils';
import { tryOnScopeDispose } from '../../hooks';

const listenOption = { passive: true };

export function useVirtual(options: UseVirtualOptions) {
  const keyElementMap = new Map<any, Element>(),
    keySizeMap = reactive(new Map<any, number>());
  let pendingMeasuredIndex: number = -1;
  const state = reactive({
    scrollOffset: ensureNumber(runIfFn(options.initialScrollOffset), 0),
    scrolling: false,
    containerSize: unrefOrGet(options.initialContainerSize) || 0,
  });

  const setContainerSize = (rect: DOMRect | ResizeObserverSize) => {
    state.containerSize =
      (rect as DOMRect)[options.horizontal ? 'width' : 'height'] ||
      (rect as ResizeObserverSize)[options.horizontal ? 'inlineSize' : 'blockSize'];
  };

  let cleanFns: AnyFn[] = [];
  const clean = () => {
    cleanFns.forEach((f) => f());
    cleanFns = [];
  };
  tryOnScopeDispose(clean);

  watchEffect(() => {
    clean();
    const { container, observeContainerResize } = options;
    const containerEl = unrefOrGet(container);
    if (!isHTMLElement(containerEl)) return;
    const targetWin = getWindow(containerEl);

    // scroll to initial position

    const handle = (rect: DOMRect | ResizeObserverSize) => {
      setContainerSize(rect);
      // notify
    };

    // scroll
    cleanFns.push(on(containerEl, 'scroll', () => {}, listenOption));
    isSupportScrollEnd() && cleanFns.push(on(containerEl, 'scrollend', () => {}, listenOption));

    handle(getRect(containerEl));

    // resize
    if (!observeContainerResize) return;
    const observer = new targetWin.ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry?.borderBoxSize) {
        const box = entry.borderBoxSize[0];
        if (box) return handle(box);
      }
      handle(getRect(containerEl));
    });
    observer.observe(containerEl, { box: 'border-box' });
    cleanFns.push(() => observer.disconnect());
  });

  const measurements = computed<UseVirtualMeasurement[]>((old) => {
    old ||= [];
    const { items, itemKey, itemSize, disabled, lanes, gap, paddingStart, scrollMargin } = options;
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
      const size = keySizeMap.get(key) ?? runIfFn(itemSize, item, minI);
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

  const measureElement = (el: Element, index: number) => {
    if (isElement(el)) {
    }
  };

  const renderItems = computed(() => {
    const { items, disabled, overscan } = options;
    const itemsArr = unrefOrGet(items),
      overscanNum = ensureNumber(runIfFn(overscan, itemsArr, state.containerSize), 10);
    if (!isArray(itemsArr) || runIfFn(disabled, itemsArr)) return [];
    const [start, end] = calculateRange(measurements.value, state.containerSize, state.scrollOffset);
    const finalStart = Math.max(0, start - overscanNum),
      finalEnd = Math.min(itemsArr.length, end + overscanNum);
    return measurements.value.slice(finalStart, finalEnd);
  });
}
