import type {
  ComponentInternalInstance,
  ExtractPropTypes,
  ComponentObjectPropsOptions,
  Ref,
  UnwrapRef,
  VueElementConstructor,
} from 'vue';
import { getCurrentInstance, provide, inject, onMounted, onBeforeUnmount, markRaw, ref, onUnmounted } from 'vue';
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
};

/**
 * create a collector used for collecting component instance between Parent Component and Children Components
 * @param name collector name
 * @param options used for inferring props type of `parent` and `child`. `parent` and `child` can be `Vue custom element` or `Vue Component Props Option`, or just an object representing their props
 * @returns
 */
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
  PE extends Data = Data
>(options?: { name?: string; parent?: P; child?: C; sort?: boolean; parentExtra?: PE }) {
  const { sort, name } = options || {};
  const items = ref<InstanceWithProps<ChildProps>[]>([]);
  const elIndexMap = new Map<Element, number>(); // need to iterate, use Map other than WeakMap, remember clear when unmount
  const COLLECTOR_KEY = Symbol(__DEV__ ? `l-collector-${name || Date.now()}` : '');
  const state = {
    parentMounted: false,
    parentEl: null as Element | null,
    parentElTagName: '',
    childElTagName: '',
  };
  const parent = (extraProvide?: PE) => {
    let instance = getCurrentInstance() as InstanceWithProps<ParentProps> | null;
    if (instance) instance = markRaw(instance);
    if (instance) {
      onMounted(() => {
        state.parentMounted = true;
        state.parentEl = instance!.vnode.el as Element;
        state.parentElTagName = state.parentEl.tagName;
        items.value.forEach((child, index) => {
          if (child.vnode.el) elIndexMap.set(child.vnode.el as Element, index);
        });
      });
      onUnmounted(() => {
        elIndexMap.clear();
        items.value = [];
      });
    }
    provide<CollectorContext<ParentProps, ChildProps>>(COLLECTOR_KEY, {
      ...extraProvide,
      parent: instance,
      items,
      addItem(child) {
        if (child && child.vnode.el) {
          const el = child.vnode.el as Element;
          if (!state.childElTagName) state.childElTagName = el.tagName;
          // if parent hasn't mounted yet, children will call 'addItem' in mount order, we don't need to sort
          // otherwise, we find previous child in dom order to insert the index
          if (state.parentMounted && sort) {
            const prev = getPreviousMatchElInTree(el, {
              isMatch: (el) => el.tagName === state.childElTagName,
              shouldStop: (el) => el === state.parentEl,
            });
            const prevIndex = elIndexMap.get(prev!);
            if (prevIndex != null) {
              items.value.splice(prevIndex + 1, 0, child);
            } else {
              items.value.unshift(child);
            }
            // update other elements' index
            for (const [el, index] of elIndexMap.entries()) {
              if (index >= (prevIndex || 0)) elIndexMap.set(el, index + 1);
            }
          } else items.value.push(child);
        }
      },
      removeItem(child) {
        if (child) {
          const el = child.vnode.el as Element;
          const index = elIndexMap.get(el);
          if (index != null) {
            items.value.splice(index, 1);
            elIndexMap.delete(el);
          }
        }
      },
    });
    return items as Ref<InstanceWithProps<ChildProps>[]>; // if don't add this, ts will report an error(ts(4058)) on createCollector, don't know why
  };
  const child = () => {
    let instance = getCurrentInstance() as UnwrapRef<InstanceWithProps<ChildProps>> | null;
    if (instance) instance = markRaw(instance);
    const context = inject<CollectorContext<ParentProps, ChildProps, PE>>(COLLECTOR_KEY);
    if (context) {
      onMounted(() => context.addItem(instance));
      onBeforeUnmount(() => context.removeItem(instance));
    }
    return context;
  };
  return { parent, child, COLLECTOR_KEY };
}
