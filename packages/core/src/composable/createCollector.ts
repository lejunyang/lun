import type {
  ComponentInternalInstance,
  ExtractPropTypes,
  ComponentObjectPropsOptions,
  Ref,
  UnwrapRef,
  VueElementConstructor,
} from 'vue';
import {
  getCurrentInstance,
  provide,
  inject,
  onMounted,
  onBeforeUnmount,
  ref,
  onUnmounted,
  shallowReactive,
  reactive,
} from 'vue';
import { getPreviousMatchElInTree, isString, toGetterDescriptors } from '@lun/utils';

type Data = Record<string, unknown>;
type InstanceWithProps<P = Data> = ComponentInternalInstance & {
  props: P;
};
export type CollectorContext<ParentProps = Data, ChildProps = Data, ParentExtra = Data> = ParentExtra & {
  parent: InstanceWithProps<ParentProps> | null;
  items: Ref<UnwrapRef<InstanceWithProps<ChildProps>>[]>;
  addItem: (child?: UnwrapRef<InstanceWithProps<ChildProps>> | null) => void;
  removeItem: (child?: UnwrapRef<InstanceWithProps<ChildProps>> | null) => void;
  getIndex(child: any): number | undefined;
};

const defaultGetEl = (vm: ComponentInternalInstance) => vm.proxy?.$el;

/**
 * create a collector used for collecting component instances between Parent Component and Children Components.\
 * First two typescript generics `parent` and `child` are used to infer props type of parent and child instance, they can be `Vue custom element` or `Vue Component Props Option`, or just an object representing their props.
 * `parentExtra` is used to infer type of parent extra provide data
 * @param options
 * @param options.sort when it's true, children collected in parent will be sorted according to their dom tree order, otherwise they are just in mount order
 * @param options.onlyForProp parent collects all children by default, use this to collect those only with same prop and propValue with parent. If it's a truthy value but not string, it will be considered as `onlyFor`
 * @returns
 */
/*! #__NO_SIDE_EFFECTS__ */
export function createCollector<
  P extends any = Data,
  C extends any = Data,
  PE extends any = Data,
  ParentProps = P extends VueElementConstructor<infer T>
    ? T
    : P extends ComponentObjectPropsOptions
    ? ExtractPropTypes<P>
    : P,
  ChildProps = C extends VueElementConstructor<infer T>
    ? T
    : P extends ComponentObjectPropsOptions
    ? ExtractPropTypes<P>
    : C,
>(options?: {
  name?: string;
  sort?: boolean;
  onlyForProp?: boolean | string;
  getParentEl?: (vm: InstanceWithProps<NoInfer<ParentProps>>) => Element;
  getChildEl?: (vm: InstanceWithProps<NoInfer<ChildProps>>) => Element;
  collectOnSetup?: boolean;
}) {
  const {
    sort,
    name,
    onlyForProp,
    getParentEl = defaultGetEl,
    getChildEl = defaultGetEl,
    collectOnSetup,
  } = options || {};
  const finalOnlyFor = onlyForProp && !isString(onlyForProp) ? 'onlyFor' : onlyForProp;
  const COLLECTOR_KEY = Symbol(__DEV__ ? `l-collector-${name || Date.now()}` : '');
  const CHILD_KEY = Symbol(__DEV__ ? `l-collector-child-${name || Date.now()}` : '');

  const parent = (params?: {
    extraProvide?: PE;
    lazyChildren?: boolean;
    onChildRemoved?: (child: InstanceWithProps<ChildProps>, index: number) => void;
  }) => {
    const items = ref<InstanceWithProps<ChildProps>[]>([]);
    const childrenElIndexMap = reactive(new Map<Element, number>()); // need to iterate, use Map other than WeakMap, remember clear when unmount
    const childrenVmElMap = new WeakMap<any, Element>(); // use `UnwrapRef<InstanceWithProps<ChildProps>>` as key will make FormItemCollector's type error...
    const state = shallowReactive({
      parentMounted: false,
      parentEl: null as Element | null,
    });
    const { extraProvide, lazyChildren = true, onChildRemoved } = params || {};
    let instance = getCurrentInstance() as InstanceWithProps<ParentProps> | null;
    if (instance) {
      onMounted(() => {
        state.parentMounted = true;
        state.parentEl = getParentEl(instance);
        if (!collectOnSetup) {
          items.value.forEach((child, index) => {
            const el = getChildEl(child as any);
            if (el) childrenElIndexMap.set(el, index);
          });
        }
      });
      onUnmounted(() => {
        childrenElIndexMap.clear();
        items.value = [];
      });
    }
    const getChildVmIndex = (childVm: any) => childrenElIndexMap.get(childrenVmElMap.get(childVm)!);

    const provideContext = Object.assign(extraProvide || {}, {
      [COLLECTOR_KEY]: true,
      parent: instance,
      items,
      addItem(child) {
        const el = child && getChildEl(child as any)!;
        if (el) {
          // if 'onlyFor' is defined, accepts child only with the same value
          if (
            finalOnlyFor &&
            instance?.props[finalOnlyFor] &&
            child.props[finalOnlyFor] !== instance.props[finalOnlyFor]
          )
            return;
          (el as any)[CHILD_KEY] = true;
          childrenVmElMap.set(child, el);
          // if parent hasn't mounted yet, children will call 'addItem' in mount order, we don't need to sort
          // otherwise, we find previous child in dom order to insert the index
          if (state.parentMounted && sort) {
            const prev = getPreviousMatchElInTree(el, {
              isMatch: (el) => (el as any)[CHILD_KEY],
              shouldStop: (el) => el === state.parentEl,
            });
            let prevIndex = childrenElIndexMap.get(prev!);
            if (prevIndex != null) {
              items.value.splice(prevIndex + 1, 0, child);
              childrenElIndexMap.set(el, prevIndex + 1);
            } else {
              items.value.unshift(child);
              childrenElIndexMap.set(el, 0);
              prevIndex = -1;
            }
            // 0 1 2(newOne) 2: prevIndex = 1, 1 + 2 < 4
            // 0 1 2 3(newOne): prevIndex = 2, 2 + 2 = 4, no need to update
            if (prevIndex! + 2 < items.value.length) {
              // update other elements' index
              for (const [otherEl, index] of childrenElIndexMap.entries()) {
                if (index > prevIndex && otherEl !== el) childrenElIndexMap.set(otherEl, index + 1);
              }
            }
          } else {
            items.value.push(child);
            if (collectOnSetup) childrenElIndexMap.set(el, items.value.length - 1);
          }
        }
      },
      removeItem(child) {
        if (child) {
          const el = childrenVmElMap.get(child)!;
          const index = childrenElIndexMap.get(el);
          if (index != null) {
            items.value.splice(index, 1);
            childrenElIndexMap.delete(el);
            // update index
            for (let i = index; i < items.value.length; i++) {
              const vm = items.value[i];
              const el = childrenVmElMap.get(vm);
              el && childrenElIndexMap.set(el, i);
            }
            if (onChildRemoved) onChildRemoved(child as any, index);
          }
        }
      },
      getIndex: getChildVmIndex,
    } as CollectorContext<ParentProps, ChildProps>) as CollectorContext<ParentProps, ChildProps, PE>;
    provide(COLLECTOR_KEY, provideContext);
    return {
      get value() {
        if (!lazyChildren || state.parentMounted) return items.value as InstanceWithProps<ChildProps>[];
        else return [];
      },
      childrenElIndexMap,
      childrenVmElMap,
      vm: instance,
      getChildVmIndex,
      provided: provideContext,
    };
  };
  const child = <T = undefined>(collect = true, defaultContext?: T) => {
    let instance = getCurrentInstance() as UnwrapRef<InstanceWithProps<ChildProps>> | null;
    type C = CollectorContext<
      ParentProps,
      ChildProps,
      PE & { readonly index: number; readonly isStart: boolean; readonly isEnd: boolean }
    >;
    let context = inject<T extends undefined ? C | undefined : C>(COLLECTOR_KEY, defaultContext as any);
    // @ts-ignore
    if (context?.[COLLECTOR_KEY]) {
      const { getIndex, items } = context;
      // create a new context with index and isStart/isEnd props for every child
      context = Object.defineProperties({} as any, {
        ...toGetterDescriptors(context),
        index: {
          get: () => getIndex(instance) ?? -1,
        },
        isStart: {
          get: () => getIndex(instance) === 0,
        },
        isEnd: {
          get: () => getIndex(instance) === items.value.length - 1,
        },
      });
      if (collect) {
        const performCollect = () => context!.addItem(instance);
        collectOnSetup ? performCollect() : onMounted(performCollect);
        onBeforeUnmount(() => context!.removeItem(instance));
      }
    }
    return context;
  };
  return { parent, child, COLLECTOR_KEY, CHILD_KEY };
}

export type CollectorParentReturn<P = Data> = ReturnType<ReturnType<typeof createCollector<P>>['parent']>;
export type CollectorChildReturn<P = Data, C = Data> = ReturnType<ReturnType<typeof createCollector<P, C>>['child']>;
