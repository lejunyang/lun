import { computed, reactive, watchEffect, setBlockTracking } from 'vue';
import { unrefOrGet } from '../../utils';
import { AnyFn, ensureNumber, isArray, isElement, isFunction, runIfFn } from '@lun/utils';
import { UseVirtualMeasurement, UseVirtualOptions } from './type';
import { getFurthestMeasurement } from './utils';
import { tryOnScopeDispose } from '../../hooks';

export function useVirtual(options: UseVirtualOptions) {
  const keyElementMap = new Map<any, Element>(),
    keySizeMap = reactive(new Map<any, number>());
  let pendingMeasuredIndex: number = -1;
  const state = reactive({
    scrollOffset: ensureNumber(runIfFn(options.initialScrollOffset), 0),
  });

  let cleanFns: AnyFn[] = [];
  const clean = () => {
    cleanFns.forEach((f) => f());
    cleanFns = [];
  };
  tryOnScopeDispose(clean);

  watchEffect(() => {
    clean();
    const { container } = options;
    const containerEl = unrefOrGet(container);

    // scroll to initial position
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
}
