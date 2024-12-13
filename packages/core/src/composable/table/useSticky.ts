import {
  ComponentInternalInstance,
  getCurrentInstance,
  inject,
  nextTick,
  provide,
  reactive,
  ShallowRef,
  shallowRef,
  watchEffect,
} from 'vue';
import { useWeakMap } from '../../hooks';
import { isCollectedItemLeaf } from '../createCollector';
import { useResizeObserver } from '../createUseObserver';
import { at, getRect } from '@lun-web/utils';
import { MaybeRefLikeOrGetter } from '../../utils';

const key = Symbol(__DEV__ ? 'sticky' : '');
type InstanceWithKey = ComponentInternalInstance & { [key]?: MaybeRefLikeOrGetter<Element> };
type StickyContext = [
  getOffset: (vm: InstanceWithKey, withSelf?: number | boolean) => number | undefined,
  getStickyType: (vm: ComponentInternalInstance | undefined) => 'left' | 'right' | undefined | boolean,
  trackElWithVm: (el: Element, vm: ComponentInternalInstance) => void,
  isStickEnd: (vm: ComponentInternalInstance | undefined) => boolean | undefined,
];
const [, getWidth, setWidth] = useWeakMap<ComponentInternalInstance, number | undefined | null>();
const processType = (type: ReturnType<StickyContext[1]>) => (type === true ? 'left' : type || undefined);
export function useStickyTable(childrenVmGetter: () => (ComponentInternalInstance | undefined)[], getStickyType: StickyContext[1]) {
  const state = reactive({
    left: [],
    right: [],
  }) as {
    left: InstanceWithKey[];
    right: InstanceWithKey[];
  };

  const finalGetStickyType = (vm: ComponentInternalInstance | undefined) => processType(getStickyType(vm));

  watchEffect(() => {
    state.left = [];
    state.right = [];
    childrenVmGetter().forEach((vm) => {
      const stickyType = finalGetStickyType(vm);
      if (stickyType === 'left') state.left.push(vm as InstanceWithKey);
      else if (stickyType === 'right') state.right.push(vm as InstanceWithKey);
    });
    state.right.reverse();
  });
  const elVmMap = new WeakMap<Element, InstanceWithKey>(),
    [, getVmEl, setVmEl] = useWeakMap<ComponentInternalInstance, Element>();
  useResizeObserver({
    targets: () => state.left.concat(state.right).map((vm) => getVmEl(vm)),
    observeOptions: {
      box: 'border-box',
    },
    callback: (entries) => {
      entries.forEach((entry) => {
        const vm = elVmMap.get(entry.target);
        if (vm) setWidth(vm, entry.borderBoxSize?.[0].inlineSize ?? getRect(entry.target).width);
      });
    },
  });

  const stickyContext: StickyContext = [
    (vm: InstanceWithKey, withSelf?: number | boolean) => {
      const stickyType = finalGetStickyType(vm),
        arr = state[stickyType!];
      if (arr) {
        if (getWidth(arr[0]) == null) return; // haven't set width yet, return undefined instead of 0
        let offset = 0;
        for (const i in arr) {
          const v = arr[i],
            width = getWidth(v);
          if (v === vm) return withSelf ? offset + (width ?? 0) : offset;
          else if (width != null) {
            if (!isCollectedItemLeaf(v)) continue; // only calculate offset for leaf nodes
            offset += width;
          }
        }
      }
    },
    finalGetStickyType,
    (el: Element | undefined, vm: ComponentInternalInstance) => {
      if (el && elVmMap.get(el) !== vm) {
        setVmEl(vm, el);
        elVmMap.set(el, vm);
        nextTick(() => {
          // initialize width in next tick in case it gets tracked
          if (getWidth(vm) == null && ['left', 'right'].includes(finalGetStickyType(vm)!))
            setWidth(vm, getRect(el).width);
        });
      }
    },
    (vm) => {
      const stickyType = finalGetStickyType(vm),
        arr = state[stickyType!];
      return arr && vm === at(arr, -1);
    },
  ];
  provide(key, stickyContext);
  return [state, stickyContext] as const;
}

type StickyStyle = { position: 'sticky'; left?: number; right?: number } | undefined;
const [, getStyle, setStyle] = useWeakMap<ComponentInternalInstance, ShallowRef<StickyStyle>>();
export function useStickyColumn() {
  const vm = getCurrentInstance() as InstanceWithKey;
  const context = inject<StickyContext>(key);
  const style = shallowRef<StickyStyle>();
  let lastOffset: number | undefined, lastType: 'left' | 'right' | undefined;
  context &&
    watchEffect(() => {
      const offset = context[0](vm),
        stickyType = processType(context[1](vm));
      if (offset === lastOffset && stickyType === lastType) return;
      if (offset != null)
        style.value = { position: 'sticky', [(lastType = stickyType!)]: `${(lastOffset = offset)}px` };
      else lastType = lastOffset = style.value = undefined;
    });
  setStyle(vm, style);

  return [(instance = vm) => getStyle(instance)?.value, context] as const;
}
