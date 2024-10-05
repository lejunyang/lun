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
} from 'vue';
import { isString, nearestBinarySearch, toGetterDescriptors } from '@lun/utils';
import { toUnrefGetterDescriptors } from '../utils';

type Data = Record<string, unknown>;
type InstanceWithProps<P = Data> = ComponentInternalInstance & {
  props: P;
};
export type CollectorContext<ParentProps = Data, ChildProps = Data, ParentExtra = Data> = ParentExtra & {
  parent: InstanceWithProps<ParentProps> | null;
  items: Ref<UnwrapRef<InstanceWithProps<ChildProps>>[]>;
  addItem: (child?: UnwrapRef<InstanceWithProps<ChildProps>> | null) => void;
  removeItem: (child?: UnwrapRef<InstanceWithProps<ChildProps>> | null) => void;
  getChildVmIndex(child: any): number | undefined;
  getChildrenCollect(itemsArr: Ref<InstanceWithProps<ChildProps>[]>): {
    addItem: (child: UnwrapRef<InstanceWithProps<ChildProps>>) => void;
    removeItem: (child: UnwrapRef<InstanceWithProps<ChildProps>>) => void;
    getChildVmIndex: (child: any) => number | undefined;
  };
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
  Tree extends boolean = false,
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
  tree?: Tree;
}) {
  const {
    sort,
    name,
    onlyForProp,
    getParentEl = defaultGetEl,
    getChildEl = defaultGetEl,
    collectOnSetup,
    tree,
  } = options || {};
  const finalOnlyFor = onlyForProp && !isString(onlyForProp) ? 'onlyFor' : onlyForProp;
  const COLLECTOR_KEY = Symbol(__DEV__ ? `l-collector-${name ? '-' + name : ''}` : '');
  const CHILD_KEY = Symbol(__DEV__ ? `l-collector-child-${name ? '-' + name : ''}` : '');

  const childrenMap = new WeakMap<any, Ref<InstanceWithProps<ChildProps>[]>>(),
    childrenVmLevelMap = tree ? new WeakMap<any, Ref<number>>() : null,
    treeVmParentMap = tree ? new WeakMap<any, any>() : null;

  const parent = (params?: {
    extraProvide?: PE;
    lazyChildren?: boolean;
    onChildRemoved?: (child: InstanceWithProps<ChildProps>, index: number) => void;
  }) => {
    const items = ref<InstanceWithProps<ChildProps>[]>([]);
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
      });
      onUnmounted(() => {
        items.value = [];
      });
    }

    const getChildrenCollect = (itemsArr: Ref<InstanceWithProps[]>) => {
      childrenMap.set(instance, itemsArr as any);
      const getChildVmIndex = (childVm: any) => itemsArr.value.indexOf(childVm);
      return {
        addItem(child: any) {
          const el = child && getChildEl(child)!,
            {
              value,
              value: { length },
            } = itemsArr;
          if (!el) return;
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
          if (state.parentMounted && sort && length) {
            const getPosition = (i: number) => {
              const res = el.compareDocumentPosition(getChildEl(value[i] as any));
              // 4: Node.DOCUMENT_POSITION_FOLLOWING 2: Node.DOCUMENT_POSITION_PRECEDING
              return res & 4 || res & 2;
            };
            let prevIndex = nearestBinarySearch(0, length - 1, getPosition, 3);
            if (!prevIndex) {
              // prevIndex is 0, check if we should insert before it or next it
              const pos = getPosition(0);
              if (pos & 4) prevIndex -= 1;
            }
            value.splice(prevIndex + 1, 0, child);
          } else {
            value.push(child);
          }
        },
        removeItem(child: any) {
          const index = getChildVmIndex(child);
          if (index > -1) {
            itemsArr.value.splice(index, 1);
            if (onChildRemoved) onChildRemoved(child as any, index);
          }
        },
        getChildVmIndex,
      };
    };

    const provideContext = Object.assign(extraProvide || {}, {
      [COLLECTOR_KEY]: true,
      parent: instance,
      items,
      getChildrenCollect,
      ...getChildrenCollect(items),
    } as CollectorContext<ParentProps, ChildProps>) as CollectorContext<ParentProps, ChildProps, PE>;
    provide(COLLECTOR_KEY, provideContext);
    return {
      get value() {
        if (!lazyChildren || state.parentMounted) return items.value as InstanceWithProps<ChildProps>[];
        else return [];
      },
      getChildEl: (vm: any) => childrenVmElMap.get(vm),
      vm: instance,
      getChildVmIndex: provideContext.getChildVmIndex,
      provided: provideContext,
      getVmTreeChildren: (vm: any) => childrenMap.get(vm)?.value || [],
      getVmTreeLevel: (tree ? (child: any) => childrenVmLevelMap!.get(child)?.value : null) as Tree extends true
        ? (child: any) => number | undefined
        : null,
      getVmTreeParent: (tree ? (child: any) => treeVmParentMap!.get(child) : null) as Tree extends true
        ? (child: any) => InstanceWithProps<ChildProps> | undefined
        : null,
    };
  };
  const child = <T = undefined>(collect = true, defaultContext?: T) => {
    let instance = getCurrentInstance() as UnwrapRef<InstanceWithProps<ChildProps>> | null;
    type C = CollectorContext<
      ParentProps,
      ChildProps,
      PE & { readonly index: number; readonly isStart: boolean; readonly isEnd: boolean } & (Tree extends true
          ? {
              readonly isLeaf: boolean;
              readonly level: number;
              readonly nestedItems: InstanceWithProps<ChildProps>[];
            }
          : {})
    >;
    let context = inject<T extends undefined ? C | undefined : C>(COLLECTOR_KEY, defaultContext as any);

    // @ts-ignore
    if (context?.[COLLECTOR_KEY]) {
      const treeDescriptors = (() => {
        if (tree) {
          const isLeaf = ref(null as null | boolean),
            level = ref(0),
            nestedItems = ref([]);
          const provideMethods = {
            getLevel: () => ((isLeaf.value = false), level.value),
            ...context.getChildrenCollect(nestedItems),
            instance,
          };
          provide(CHILD_KEY, provideMethods);
          const parentProvide = inject<typeof provideMethods>(CHILD_KEY);
          if (parentProvide) {
            level.value = parentProvide.getLevel() + 1;
            treeVmParentMap!.set(instance, parentProvide.instance);
          }
          childrenVmLevelMap!.set(instance!, level);
          onMounted(() => {
            if (isLeaf.value == null) isLeaf.value = true;
            parentProvide?.addItem(instance!);
          });
          onBeforeUnmount(() => {
            parentProvide?.removeItem(instance!);
          });
          return toUnrefGetterDescriptors({ isLeaf, level, nestedItems });
        }
      })();

      const { getChildVmIndex, items } = context;
      // create a new context with index and isStart/isEnd props for every child
      context = Object.defineProperties({} as any, {
        ...toGetterDescriptors(context),
        index: {
          get: () => getChildVmIndex(instance) ?? -1,
        },
        isStart: {
          get: () => getChildVmIndex(instance) === 0,
        },
        isEnd: {
          get: () => getChildVmIndex(instance) === items.value.length - 1,
        },
        ...treeDescriptors,
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
