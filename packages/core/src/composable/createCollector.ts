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
  markRaw,
  ref,
  onUnmounted,
  shallowReactive,
} from 'vue';
import { getPreviousMatchElInTree } from '@lun/utils';

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

/**
 * create a collector used for collecting component instance between Parent Component and Children Components
 * @param options `name` `parent` `child` and `parentExtra` are used for dev experience.
 * `parent` and `child` are used to infer props type of parent and child instance, they can be `Vue custom element` or `Vue Component Props Option`, or just an object representing their props.
 * `parentExtra` is used to infer type of parent extra provide data
 * @param options.sort when it's true, children collected in parent will be sorted according to their dom tree order, otherwise they are just in mount order
 * @param options.onlyForProp parent collects all children by default, use this to collect those only with same prop and propValue with parent. If it's a truthy value but not string, it will be considered as `onlyFor`
 * @returns
 */
/*! #__NO_SIDE_EFFECTS__ */
export function createCollector<
  P extends any = Data,
  C extends any = Data,
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
  PE extends Data = Data,
>(options?: {
  name?: string;
  parent?: P;
  child?: C;
  parentExtra?: PE;
  sort?: boolean;
  onlyForProp?: boolean | string;
  getParentEl?: (node: Node) => Element;
  getChildEl?: (node: Node) => Element;
}) {
  const { sort, name, onlyForProp, getParentEl, getChildEl } = options || {};
  const finalOnlyFor = onlyForProp && typeof onlyForProp !== 'string' ? 'onlyFor' : onlyForProp;
  const COLLECTOR_KEY = Symbol(__DEV__ ? `l-collector-${name || Date.now()}` : '');
  const CHILD_KEY = Symbol(__DEV__ ? `l-collector-child-${name || Date.now()}` : '');

  const finalGetChildEl = (vm: UnwrapRef<InstanceWithProps<ChildProps>>) => {
    let el = vm.proxy?.$el;
    if (getChildEl) el = getChildEl(el);
    return el as Element | undefined;
  };

  const parent = (params?: {
    extraProvide?: PE;
    lazyChildren?: boolean;
    onChildRemoved?: (child: InstanceWithProps<ChildProps>, index: number) => void;
  }) => {
    const items = ref<InstanceWithProps<ChildProps>[]>([]);
    const childrenElIndexMap = new Map<Element, number>(); // need to iterate, use Map other than WeakMap, remember clear when unmount
    const childrenVmElMap = new WeakMap<any, Element>(); // use `UnwrapRef<InstanceWithProps<ChildProps>>` as key will make FormItemCollector's type error...
    const state = shallowReactive({
      parentMounted: false,
      parentEl: null as Element | null,
    });
    const indexUpdate = ref();
    const notifyIndexUpdate = () => (indexUpdate.value = Date.now());
    const { extraProvide, lazyChildren = true, onChildRemoved } = params || {};
    let instance = getCurrentInstance() as InstanceWithProps<ParentProps> | null;
    if (instance) instance = markRaw(instance);
    if (instance) {
      onMounted(() => {
        state.parentMounted = true;
        state.parentEl = instance!.proxy?.$el as Element;
        if (getParentEl) state.parentEl = getParentEl(state.parentEl);
        items.value.forEach((child, index) => {
          const el = finalGetChildEl(child);
          if (el) childrenElIndexMap.set(el, index);
        });
        notifyIndexUpdate();
      });
      onUnmounted(() => {
        childrenElIndexMap.clear();
        items.value = [];
        notifyIndexUpdate();
      });
    }
    const getChildVmIndex = (childVm: any) => {
      indexUpdate.value; // trigger computed
      return childrenElIndexMap.get(childrenVmElMap.get(childVm)!);
    };

    const provideContext = {
      ...extraProvide,
      [COLLECTOR_KEY]: true,
      parent: instance,
      items,
      addItem(child) {
        if (child && child.proxy?.$el) {
          // if 'onlyFor' is defined, accepts child only with the same value
          if (
            finalOnlyFor &&
            instance?.props[finalOnlyFor] &&
            child.props[finalOnlyFor] !== instance.props[finalOnlyFor]
          )
            return;
          const el = finalGetChildEl(child)!;
          Object.assign(el, { [CHILD_KEY]: true });
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
            notifyIndexUpdate();
          } else {
            items.value.push(child);
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
            notifyIndexUpdate();
            if (onChildRemoved) onChildRemoved(child as any, index);
          }
        }
      },
      getIndex: getChildVmIndex,
    } as CollectorContext<ParentProps, ChildProps>;
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
    if (instance) instance = markRaw(instance);
    type C = CollectorContext<
      ParentProps,
      ChildProps,
      PE & { readonly index: number; readonly isStart: boolean; readonly isEnd: boolean }
    >;
    let context = inject<T extends undefined ? C | undefined : C>(COLLECTOR_KEY, defaultContext as any);
    // @ts-ignore
    if (context?.[COLLECTOR_KEY] && collect) {
      const { getIndex, items } = context;
      context = Object.defineProperties({} as any, {
        ...Object.getOwnPropertyDescriptors(context),
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
      onMounted(() => context!.addItem(instance));
      onBeforeUnmount(() => context!.removeItem(instance));
    }
    return context;
  };
  return { parent, child, COLLECTOR_KEY, CHILD_KEY };
}

export type CollectorParentReturn<P = Data> = ReturnType<ReturnType<typeof createCollector<P>>['parent']>;
export type CollectorChildReturn<P = Data, C = Data> = ReturnType<ReturnType<typeof createCollector<P, C>>['child']>;

// it's a must if sort is enabled and render return a fragment, as getPreviousMatchElInTree will not work for fragment node
export const getHostOfRootShadow = (el: Node) => (el.parentNode as ShadowRoot).host;
