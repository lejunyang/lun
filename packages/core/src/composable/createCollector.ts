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
  readonly,
  nextTick,
  markRaw,
  unref,
} from 'vue';
import { AnyFn, isString, nearestBinarySearch, runIfFn, toGetterDescriptors } from '@lun-web/utils';
import { toUnrefGetterDescriptors } from '../utils';
import { createMapCountMethod, useRefWeakMap } from '../hooks';

type Data = Record<string, unknown>;
export type InstanceWithProps<P = Data> = ComponentInternalInstance & {
  props: P;
};
type ParentReadonlyState = Readonly<{
  parentMounted: boolean;
  parentEl: Element | null;
  waitDone: boolean;
  maxChildLevel: number;
  maxLevelChild: ComponentInternalInstance | null;
}>;
export type CollectorContext<ParentProps = Data, ChildProps = Data, ParentExtra = Data> = ParentExtra & {
  parent: InstanceWithProps<ParentProps> | null;
  items: Ref<UnwrapRef<InstanceWithProps<ChildProps>>[]>;
  getItems: () => InstanceWithProps<ChildProps>[];
  addItem: (child?: UnwrapRef<InstanceWithProps<ChildProps>> | null) => void;
  removeItem: (child?: UnwrapRef<InstanceWithProps<ChildProps>> | null) => void;
  getChildrenCollect(itemsArr: Ref<InstanceWithProps<ChildProps>[]>): {
    addItem: (child: UnwrapRef<InstanceWithProps<ChildProps>>) => void;
    removeItem: (child: UnwrapRef<InstanceWithProps<ChildProps>>) => void;
  };
  state: ParentReadonlyState;
  updateMaxLevel(level: number, child: UnwrapRef<InstanceWithProps<ChildProps>>, isUnmounting?: number): void;
  childSetup?: AnyFn;
};

const defaultGetEl = (vm: ComponentInternalInstance) => vm.proxy?.$el;

const [getTreeChildren, setTreeChildren, deleteTreeChildren] = useRefWeakMap<
    any,
    Ref<InstanceWithProps<any>[]> | unknown[]
  >(),
  [getTreeLevel, setTreeLevel, deleteTreeLevel] = useRefWeakMap<any, Ref<number> | number>(),
  [getTreeParent, setTreeParent, deleteTreeParent] = useRefWeakMap<any, any>(),
  [getIndex, setIndex] = useRefWeakMap<any, number>(),
  /** tree index is the index among the children of same parent in tree */
  [getTreeIndex, setTreeIndex] = useRefWeakMap<any, number>(),
  [getIsLeaf, setItemLeaf] = useRefWeakMap<any, boolean>(),
  leavesCountMap = useRefWeakMap<any, number>(),
  [getLeavesCount] = leavesCountMap,
  leavesCountUp = createMapCountMethod(leavesCountMap, 1),
  leavesCountDown = createMapCountMethod(leavesCountMap, -1);

/** @internal */
export const getCollectedItemTreeChildren = (item?: unknown) => unref(getTreeChildren(item)) || [];
/** @internal */
export const getCollectedItemTreeLevel = (item?: unknown) => unref(getTreeLevel(item));
/** @internal */
export const getCollectedItemTreeParent = (item?: unknown): unknown | undefined => getTreeParent(item);
/** @internal */
export const getCollectedItemIndex: (item?: unknown) => number | undefined = getIndex;
/** @internal */
export const getCollectedItemTreeIndex: (item?: unknown) => number | undefined = getTreeIndex;
/** @internal */
export const isCollectedItemLeaf = (item?: unknown) => getIsLeaf(item) === true;
/** @internal */
export const getCollectedItemLeavesCount = (item: unknown) => getLeavesCount(item) ?? 0;

const isFirst = (item: unknown) => getIndex(item) === 0,
  selfAndParentFirst = (item: unknown): boolean =>
    getTreeIndex(item) === 0 && (!getTreeParent(item) || selfAndParentFirst(getTreeParent(item)));
/** @internal */
export const isCollectedItemFirstLeaf = (item: unknown) =>
  isCollectedItemLeaf(item) && (isFirst(item) || selfAndParentFirst(item));
/** @internal first branch means nodes in this branch are all treeIndex=0 */
export const isCollectedItemInFirstBranch = selfAndParentFirst;

const calcLevel = (item: unknown, level: number): number =>
  isCollectedItemLeaf(item)
    ? level
    : Math.max(...getCollectedItemTreeChildren(item).map((i) => calcLevel(i, level + 1)));
/** @internal */
export const getCollectedItemMaxChildLevel = (item: unknown) => calcLevel(item, 0);

/**
 * create a collector used for collecting component instances between Parent Component and Children Components.\
 * First two typescript generics `parent` and `child` are used to infer props type of parent and child instance, they can be `Vue custom element` or `Vue Component Props Option`, or just an object representing their props.
 * `parentExtra` is used to infer type of parent extra provide data
 * @param options
 * @param options.sort when it's true, children collected in parent will be sorted according to their dom tree order, otherwise they are just in mount order
 * @param options.onlyForProp parent collects all children by default, use this to collect those only with same prop and propValue with parent. If it's a truthy value but not string, it will be considered as `onlyFor`
 * @returns
 */
/*@__NO_SIDE_EFFECTS__*/
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
  skipChild?: (vm: InstanceWithProps<NoInfer<ChildProps>>, parentEl?: Element | null) => boolean;
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
    childSetup?: (
      props: ChildProps,
      vm: InstanceWithProps<ChildProps>,
      context: CollectorContext<ParentProps, ChildProps, PE>,
    ) => void;
    onBeforeChildAdd?: (child: InstanceWithProps<ChildProps>) => boolean | void;
    onChildAdded?: (child: InstanceWithProps<ChildProps>, index: number, isAddToTopParent?: boolean) => void;
    onChildRemoved?: (child: InstanceWithProps<ChildProps>, index: number, isRemoveFromTopParent?: boolean) => void;
  }) => {
    const {
      extraProvide,
      lazyChildren = true,
      childSetup,
      onBeforeChildAdd,
      onChildAdded,
      onChildRemoved,
    } = params || {};
    const items = ref<InstanceWithProps<ChildProps>[]>([]);
    const state = shallowReactive({
      parentMounted: false,
      parentEl: null as Element | null,
      waitDone: !needWait,
      maxChildLevel: 0,
      maxLevelChild: null as UnwrapRef<InstanceWithProps<ChildProps>> | null,
    });

    let instance = getCurrentInstance() as InstanceWithProps<ParentProps> | null;
    if (instance) {
      markRaw(instance);
      if (collectOnSetup) state.parentEl = getParentEl(instance);
      onMounted(() => {
        state.parentMounted = true;
        state.parentEl = getParentEl(instance);
        if (needWait) {
          nextTick(() => {
            state.waitDone = true;
          });
        }
      });
      onUnmounted(() => {
        items.value = [];
      });
    }

    const getChildrenCollect = (itemsArr: Ref<InstanceWithProps[]>, isTopParent?: boolean) => {
      const updateIndexes = (newIndex: number) => {
        for (let i = newIndex; i < itemsArr.value.length; i++) {
          (isTopParent ? setIndex : setTreeIndex)(itemsArr.value[i], i);
        }
      };
      return {
        addItem(child: any) {
          if (!child || runIfFn(skipChild, child, state.parentEl) === true) return;
          const el = getChildEl(child)!,
            {
              value,
              value: { length },
            } = itemsArr;
          // if 'onlyFor' is defined, accepts child only with the same value
          if (
            (onBeforeChildAdd && onBeforeChildAdd(child) === false) ||
            (finalOnlyFor &&
              instance?.props[finalOnlyFor] &&
              child.props[finalOnlyFor] !== instance.props[finalOnlyFor])
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
            const newIndex = prevIndex + 1;
            value.splice(newIndex, 0, child);
            updateIndexes(newIndex);
            if (onChildAdded) onChildAdded(child, newIndex, isTopParent);
          } else {
            value.push(child);
            const newIndex = value.length - 1;
            (isTopParent ? setIndex : setTreeIndex)(child, newIndex);
            if (onChildAdded) onChildAdded(child, newIndex, isTopParent);
          }
        },
        removeItem(child: any) {
          const index = (isTopParent ? getIndex : getTreeIndex)(child)!;
          if (index > -1) {
            itemsArr.value.splice(index, 1);
            updateIndexes(index);
            if (onChildRemoved) onChildRemoved(child as any, index, isTopParent);
          }
        },
      };
    };

    const empty: InstanceWithProps<ChildProps>[] = [],
      getChildren = () => {
        if ((!lazyChildren || state.parentMounted) && state.waitDone)
          return items.value as InstanceWithProps<ChildProps>[];
        else return empty;
      };
    const readonlyState = readonly(state) as ParentReadonlyState;
    const provideContext = Object.assign(extraProvide || {}, {
      [COLLECTOR_KEY]: true,
      parent: instance,
      items,
      state: readonlyState,
      getItems: getChildren,
      childSetup,
      updateMaxLevel: (maxLevel: number, child: any, isUnmounting?: number) => {
        if (maxLevel > state.maxChildLevel) {
          state.maxChildLevel = maxLevel;
          state.maxLevelChild = child;
        }
        if (isUnmounting && state.maxLevelChild === child) {
          state.maxChildLevel = 0;
          items.value.forEach((item) => {
            const level = getCollectedItemTreeLevel(item)!;
            if (level > state.maxChildLevel) {
              state.maxChildLevel = level;
              state.maxLevelChild = item;
            }
          });
        }
      },
      getChildrenCollect,
      ...getChildrenCollect(items, true),
    } as CollectorContext<ParentProps, ChildProps>) as CollectorContext<ParentProps, ChildProps, PE>;
    provide(COLLECTOR_KEY, provideContext);
    return {
      get value() {
        return getChildren();
      },
      state: readonlyState,
      getChildren,
      vm: instance,
      provided: provideContext,
    };
  };
  const child = <T = undefined>(collect = true, defaultContext?: T) => {
    const instance = getCurrentInstance() as UnwrapRef<InstanceWithProps<ChildProps>>;
    if (!instance) throw new Error('');
    markRaw(instance);
    type C = CollectorContext<
      ParentProps,
      ChildProps,
      PE & { readonly index: number; readonly isStart: boolean; readonly isEnd: boolean } & (Tree extends true
          ? {
              readonly level: number;
              readonly treeIndex: number;
              readonly nestedItems: InstanceWithProps<ChildProps>[];
            }
          : {})
    >;
    if (!collect && (instance as any)[CHILD_KEY])
      return (instance as any)[CHILD_KEY] as T extends undefined ? C | undefined : C;
    let context = inject<T extends undefined ? C | undefined : C>(COLLECTOR_KEY, defaultContext as any);

    // @ts-ignore
    if (context?.[COLLECTOR_KEY]) {
      const treeDescriptors = (() => {
        if (tree && collect) {
          const level = ref(0),
            nestedItems = ref([]);
          setTreeChildren(instance, nestedItems);
          const provideMethods = {
            getLevel: () => (setItemLeaf(instance, false), level.value),
            ...context.getChildrenCollect(nestedItems),
            instance,
            cb: (isUnmount?: number) => {
              isUnmount ? leavesCountDown(instance) : leavesCountUp(instance);
            },
          };
          const parentProvide = inject<typeof provideMethods>(CHILD_KEY);
          if (parentProvide) {
            level.value = parentProvide.getLevel() + 1;
            setTreeParent(instance, parentProvide.instance);
            const original = provideMethods.cb;
            provideMethods.cb = (isUnmount) => (original(isUnmount), parentProvide.cb(isUnmount));
          }
          provide(CHILD_KEY, provideMethods);
          setTreeLevel(instance, level);
          const performCollect = () => parentProvide?.addItem(instance!);
          collectOnSetup ? performCollect() : onMounted(performCollect);
          onMounted(() => {
            const update = () => {
              if (getIsLeaf(instance) == null) {
                setItemLeaf(instance, true);
                parentProvide?.cb();
                context!.updateMaxLevel(level.value, instance);
              }
            };
            // for custom element, need to delay to update isLeaf and callback, otherwise leavesCount is incorrect
            instance.ce ? nextTick(update) : update();
          });
          onBeforeUnmount(() => {
            deleteTreeChildren(instance);
            deleteTreeParent(instance);
            deleteTreeLevel(instance);
            parentProvide?.removeItem(instance!);
            if (isCollectedItemLeaf(instance)) {
              parentProvide?.cb(1);
              context!.updateMaxLevel(level.value, instance, 1);
            }
          });
          return toUnrefGetterDescriptors({
            level,
            nestedItems,
            treeIndex: () => getTreeIndex(instance),
          });
        }
      })();

      const { items } = context;
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
        ...treeDescriptors,
      });
      if (collect) {
        const performCollect = () => context!.addItem(instance);
        collectOnSetup ? performCollect() : onMounted(performCollect);
        onBeforeUnmount(() => context!.removeItem(instance));
        runIfFn(context!.childSetup, instance.props, instance, context);
      }
      (instance as any)[CHILD_KEY] = context;
    }
    return context;
  };
  return { parent, child, COLLECTOR_KEY, CHILD_KEY };
}

export type CollectorParentReturn = ReturnType<ReturnType<typeof createCollector>['parent']>;
export type CollectorChildReturn<P = Data, C = Data> = ReturnType<ReturnType<typeof createCollector<P, C>>['child']>;
