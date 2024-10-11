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
  readonly,
} from 'vue';
import { isString, nearestBinarySearch, runIfFn, toGetterDescriptors } from '@lun/utils';
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

const vmChildrenMap = reactive(new WeakMap<any, Ref<InstanceWithProps<any>[]>>()),
  vmTreeLevelMap = reactive(new WeakMap<any, Ref<number>>()),
  vmTreeParentMap = reactive(new WeakMap<any, any>());

export const getVmTreeDirectChildren = (vm?: ComponentInternalInstance) => vmChildrenMap.get(vm)?.value || [];
export const getVmTreeLevel = (child?: ComponentInternalInstance) => vmTreeLevelMap.get(child)?.value;
export const getVmTreeParent = (child?: ComponentInternalInstance): ComponentInternalInstance | undefined =>
  vmTreeParentMap.get(child);

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
  skipChild?: (vm: InstanceWithProps<NoInfer<ChildProps>>, parentEl: Element) => boolean;
  tree?: Tree;
  /** it's for vue custom elements to delay getting items.value, as all children's setups are after parent's mount  */
  needWait?: boolean;
}) {
  const {
    sort,
    name,
    onlyForProp,
    getParentEl = defaultGetEl,
    getChildEl = defaultGetEl,
    collectOnSetup,
    skipChild,
    tree,
    needWait,
  } = options || {};
  const finalOnlyFor = onlyForProp && !isString(onlyForProp) ? 'onlyFor' : onlyForProp;
  const COLLECTOR_KEY = Symbol(__DEV__ ? `l-collector-${name ? '-' + name : ''}` : '');
  const CHILD_KEY = Symbol(__DEV__ ? `l-collector-child-${name ? '-' + name : ''}` : '');

  const parent = (params?: {
    extraProvide?: PE;
    lazyChildren?: boolean;
    onChildAdded?: (child: InstanceWithProps<ChildProps>, index: number, isAddToTopParent?: boolean) => void;
    onChildRemoved?: (child: InstanceWithProps<ChildProps>, index: number, isRemoveFromTopParent?: boolean) => void;
  }) => {
    const { extraProvide, lazyChildren = true, onChildAdded, onChildRemoved } = params || {};
    const items = ref<InstanceWithProps<ChildProps>[]>([]);
    const state = shallowReactive({
      parentMounted: false,
      parentEl: null as Element | null,
      waitDone: !needWait,
    });
    let waitTimer: any;
    const updateWait = () => {
      if (!needWait || state.waitDone) return;
      clearTimeout(waitTimer);
      waitTimer = setTimeout(() => {
        state.waitDone = true;
      });
    };
    let instance = getCurrentInstance() as InstanceWithProps<ParentProps> | null;
    if (instance) {
      onMounted(() => {
        state.parentMounted = true;
        state.parentEl = getParentEl(instance);
        updateWait();
      });
      onUnmounted(() => {
        items.value = [];
      });
    }

    const getChildrenCollect = (itemsArr: Ref<InstanceWithProps[]>, isTopParent?: boolean) => {
      const getChildVmIndex = (childVm: any) => itemsArr.value.indexOf(childVm);
      return {
        addItem(child: any) {
          if (!child || runIfFn(skipChild, child, state.parentEl!) === true) return;
          const el = getChildEl(child)!,
            {
              value,
              value: { length },
            } = itemsArr;
          // if 'onlyFor' is defined, accepts child only with the same value
          if (
            finalOnlyFor &&
            instance?.props[finalOnlyFor] &&
            child.props[finalOnlyFor] !== instance.props[finalOnlyFor]
          )
            return;
          // if parent hasn't mounted yet, children will call 'addItem' in mount order, we don't need to sort
          // otherwise, we find previous child in dom order to insert the index
          if (el && state.parentMounted && sort && length) {
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
            if (onChildAdded) onChildAdded(child, prevIndex + 1, isTopParent);
          } else {
            value.push(child);
            if (onChildAdded) onChildAdded(child, value.length - 1, isTopParent);
          }
          isTopParent && updateWait();
        },
        removeItem(child: any) {
          const index = getChildVmIndex(child);
          if (index > -1) {
            itemsArr.value.splice(index, 1);
            if (onChildRemoved) onChildRemoved(child as any, index, isTopParent);
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
      ...getChildrenCollect(items, true),
    } as CollectorContext<ParentProps, ChildProps>) as CollectorContext<ParentProps, ChildProps, PE>;
    provide(COLLECTOR_KEY, provideContext);
    const empty: InstanceWithProps<ChildProps>[] = [],
      getChildren = () => {
        if ((!lazyChildren || state.parentMounted) && state.waitDone)
          return items.value as InstanceWithProps<ChildProps>[];
        else return empty;
      };
    return {
      get value() {
        return getChildren();
      },
      state: readonly(state) as Readonly<{
        parentMounted: boolean;
        parentEl: Element | null;
        waitDone: boolean;
      }>,
      getChildren,
      vm: instance,
      getChildVmIndex: provideContext.getChildVmIndex,
      provided: provideContext,
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
          vmChildrenMap.set(instance, nestedItems);
          const provideMethods = {
            getLevel: () => ((isLeaf.value = false), level.value),
            ...context.getChildrenCollect(nestedItems),
            instance,
          };
          provide(CHILD_KEY, provideMethods);
          const parentProvide = inject<typeof provideMethods>(CHILD_KEY);
          if (parentProvide) {
            level.value = parentProvide.getLevel() + 1;
            vmTreeParentMap.set(instance, parentProvide.instance);
          }
          vmTreeLevelMap.set(instance!, level);
          const performCollect = () => parentProvide?.addItem(instance!);
          collectOnSetup ? performCollect() : onMounted(performCollect);
          onMounted(() => {
            if (isLeaf.value == null) isLeaf.value = true;
          });
          onBeforeUnmount(() => {
            vmChildrenMap.delete(instance);
            vmTreeParentMap.delete(instance);
            vmTreeLevelMap.delete(instance!);
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

export type CollectorParentReturn = ReturnType<ReturnType<typeof createCollector>['parent']>;
export type CollectorChildReturn<P = Data, C = Data> = ReturnType<ReturnType<typeof createCollector<P, C>>['child']>;
