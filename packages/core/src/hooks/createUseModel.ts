import { AnyFn, isFunction } from '@lun/utils';
import type { WritableComputedRef, UnwrapRef, Ref, ComponentInternalInstance } from 'vue';
import { computed, getCurrentInstance, nextTick, ref, watch } from 'vue';

// inspired by @vue/use useVModel

interface UseModelOptions<O, K extends keyof O, Passive extends boolean = false, T = O[K]> {
  passive?: Passive;
  eventName?: string;
  deep?: boolean;
  extraSource?: () => T;
  clone?: boolean | ((val: T) => T);
  shouldEmit?: false | ((v: T) => boolean);
  emit?: (name: string, ...args: any[]) => void;
  key?: K;
}

/*! #__NO_SIDE_EFFECTS__ */
export function createUseModel<DK extends string, E extends () => any>({
  defaultKey,
  defaultEvent,
  handleDefaultEmit,
  extra,
  getFromExtra,
  setByExtra,
}: {
  defaultKey: DK;
  defaultEvent: string;
  handleDefaultEmit?: (fn: AnyFn, vm: ComponentInternalInstance) => AnyFn;
  extra?: E;
  getFromExtra?: (extra: ReturnType<E> & {}) => any;
  setByExtra?: (extra: ReturnType<E> & {}, value: any) => void;
}) {
  return function <P extends Record<string | symbol, unknown>, K extends keyof P = DK, Passive extends boolean = false>(
    props: P,
    options?: UseModelOptions<P, K, Passive>,
  ) {
    const extraData = extra && extra();
    let { passive = true, eventName, deep, extraSource, shouldEmit, clone, emit, key } = options || {};
    key = key || (defaultKey as unknown as K);
    const event = eventName || defaultEvent;
    const vm = getCurrentInstance();
    if (!emit && vm) {
      emit = vm.emit || vm.proxy?.$emit?.bind(vm.proxy);
      if (handleDefaultEmit) emit = handleDefaultEmit(emit, vm);
    }
    const cloneFn = (val: P[K]) =>
      !clone ? val : isFunction(clone) ? clone(val) : JSON.parse(JSON.stringify(val));
    const getter = () => {
      const value = extraData && getFromExtra && getFromExtra(extraData);
      if (value !== undefined) return value;
      return props[key!] !== undefined
        ? cloneFn(props[key!])
        : isFunction(extraSource)
        ? extraSource()
        : undefined;
    };
    const triggerEmit = (value: P[K]) => {
      if (shouldEmit === false) return;
      if (!shouldEmit || shouldEmit(value)) {
        emit!(event, value);
      }
    };
    if (passive) {
      const initialValue = getter();
      const proxy = ref<P[K]>(initialValue!);
      let isUpdating = false;
      watch(getter, (v) => {
        if (!isUpdating) {
          isUpdating = true;
          (proxy as any).value = v;
          nextTick(() => (isUpdating = false));
        }
      });
      watch(
        proxy,
        (v) => {
          if (!isUpdating && (v !== getter() || deep)) {
            if (extraData && setByExtra) setByExtra(extraData, v);
            triggerEmit(v as P[K]);
          }
        },
        { deep },
      );

      return proxy;
    } else {
      return computed<P[K]>({
        get() {
          return getter()!;
        },
        set(value) {
          if (extraData && setByExtra) setByExtra(extraData, value);
          triggerEmit(value);
        },
      });
    }
  };
}

export interface UseModel<DK extends string> {
  <P extends Record<string | symbol, unknown>, K extends keyof P = DK>(
    props: P,
    options?: UseModelOptions<P, K, false>,
  ): WritableComputedRef<P[K]>;
  <P extends Record<string | symbol, unknown>, K extends keyof P = DK>(
    props: P,
    options?: UseModelOptions<P, K, true>,
  ): Ref<UnwrapRef<P[K]>>;
}
