import {
  ComponentInternalInstance,
  getCurrentInstance,
  inject,
  provide,
  reactive,
  Ref,
  shallowRef,
  toRaw,
  watch,
  watchEffect,
} from 'vue';
import { useWeakMap } from '../../hooks';
import { CollectorParentReturn } from '../createCollector';
import { useResizeObserver } from '../createUseObserver';
import { getRect } from '@lun-web/utils';

const key = Symbol(__DEV__ ? 'sticky' : '');
type InstanceWithKey = ComponentInternalInstance & { [key]?: Ref<Element | undefined> };
type StickyContext = [
  getOffset: (vm: InstanceWithKey) => number | undefined,
  getStickyType: (vm: ComponentInternalInstance) => 'left' | 'right' | undefined | boolean,
  collected: () => number,
];
const [, getWidth, setWidth] = useWeakMap<ComponentInternalInstance, number | undefined | null>();
const processType = (type: ReturnType<StickyContext[1]>) => (type === true ? 'left' : type || undefined);
export function useStickyTable(context: CollectorParentReturn, getStickyType: StickyContext[1]) {
  const state = reactive({
    left: [] as InstanceWithKey[],
    right: [] as InstanceWithKey[],
  });
  watchEffect(() => {
    state.left = [];
    state.right = [];
    context.value.forEach((vm) => {
      const stickyType = processType(getStickyType(vm));
      if (stickyType === 'left') state.left.push(vm as InstanceWithKey);
      else if (stickyType === 'right') state.right.push(vm as InstanceWithKey);
    });
  });
  const elVmMap = useWeakMap<Element, InstanceWithKey>();
  useResizeObserver({
    targets: () =>
      state.left.concat(state.right).map((vm) => {
        const el = vm[key]?.value;
        if (el) elVmMap.set(el, vm);
        return el;
      }),
    callback: (entries) => {
      entries.forEach((entry) => {
        const vm = elVmMap.get(entry.target);
        if (vm) setWidth(vm, entry.contentRect.width);
      });
    },
  });

  provide<StickyContext>(key, [
    (vm: InstanceWithKey) => {
      const stickyType = processType(getStickyType(vm)),
        arr = state[stickyType!];
      if (arr) {
        if (getWidth(arr[0]) == null) return; // haven't set width yet, return undefined instead of 0
        let offset = 0;
        for (const i in arr) {
          const v = arr[i],
            width = getWidth(v);
          // MUST call toRaw, as it's processed by reactive
          if (toRaw(v) === vm) return offset;
          else if (width != null) {
            offset += width;
          }
        }
      }
    },
    getStickyType,
    () => state.left.length + state.right.length,
  ]);
}

export function useStickyColumn(elRef: Ref<Element | undefined>) {
  const vm = getCurrentInstance() as InstanceWithKey;
  vm[key] = elRef;
  const context = inject<StickyContext>(key);
  const style = shallowRef<{ position: 'sticky'; left?: number; right?: number } | undefined>();
  let lastOffset: number | undefined;
  context &&
    watchEffect(() => {
      const offset = context[0](vm),
        stickyType = processType(context[1](vm));
      if (offset != null && lastOffset !== offset) {
        return (style.value = { position: 'sticky', [stickyType!]: `${(lastOffset = offset)}px` });
      }
      lastOffset = style.value = undefined;
    });

  const unwatch =
    context &&
    watch(
      [elRef, () => processType(context[1](vm)), context[2]],
      ([el, type, nums]) => {
        // if no collected, also need to return as at that time, the width may not be correct
        if ((type !== 'left' && type !== 'right') || !el || !nums) return;
        // only set width once. Later it's updated by ResizeObserver
        setWidth(vm, getRect(el).width);
        unwatch!();
      },
      { flush: 'post' },
    );
  return () => style.value;
}
