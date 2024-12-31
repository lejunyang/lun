import { AnyFn, isFunction } from '@lun-web/utils';
import type { WritableComputedRef, UnwrapRef, Ref, ComponentInternalInstance } from 'vue';
import { computed, getCurrentInstance, nextTick, ref, watch } from 'vue';

// inspired by @vue/use useVModel

interface UseModelOptions<
  O,
  K extends keyof O,
  Passive extends boolean = false,
  HasRaw extends boolean = false,
  T = O[K],
> {
  passive?: Passive;
  eventName?: string;
  deep?: boolean;
  extraSource?: () => T;
  clone?: boolean | ((val: T) => T);
  shouldEmit?: false | ((v: T) => boolean);
  emit?: (name: string, ...args: any[]) => void;
  key?: K;
  /** if `hasRaw` is true, the value will be wrapped in an object with `value` and `raw` properties, and `passive` will be set to true.
   * `raw` will be used to store complex object so that we can avoid unnecessary parse back and from every time the value changes
   * e.g. Calendar component, value will be { value: string, raw?: Dayjs }; Select component, value will be { value: string[], raw?: Set<string> }
   */
  hasRaw?: HasRaw;
}

/*@__NO_SIDE_EFFECTS__*/
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
  getFromExtra?: (extra: ReturnType<E> & {}, raw?: boolean) => any;
  setByExtra?: (extra: ReturnType<E> & {}, value: any, raw?: any) => void;
}) {
  return function <P extends Record<string | symbol, unknown>, K extends keyof P = DK, Passive extends boolean = false>(
    props: P,
    options?: UseModelOptions<P, K, Passive>,
  ) {
    const extraData = extra && extra();
    let { passive = true, eventName, deep, extraSource, shouldEmit, clone, emit, key, hasRaw } = options || {};
    if (hasRaw) passive = true;
    key = key || (defaultKey as unknown as K);
    const event = eventName || defaultEvent;
    const vm = getCurrentInstance();
    if (!emit && vm) {
      emit = vm.emit || vm.proxy?.$emit?.bind(vm.proxy);
      if (handleDefaultEmit) emit = handleDefaultEmit(emit, vm);
    }
    const cloneFn = (val: P[K]) => (!clone ? val : isFunction(clone) ? clone(val) : JSON.parse(JSON.stringify(val)));
    const getter = () => {
      const value = extraData && getFromExtra && getFromExtra(extraData, hasRaw);
      if (value !== undefined) return value;
      return props[key!] !== undefined ? cloneFn(props[key!]) : isFunction(extraSource) ? extraSource() : undefined;
    };
    const triggerEmit = (value: P[K]) => {
      if (shouldEmit === false) return;
      if (!shouldEmit || shouldEmit(value)) {
        emit!(event, value);
      }
    };
    if (passive) {
      const initialValue = getter();
      const proxy = ref<any>(hasRaw ? { value: initialValue } : initialValue!);
      let isUpdating = false;
      watch(getter, (v) => {
        if (!isUpdating && (!hasRaw || (v !== proxy.value.value && v !== proxy.value.raw))) {
          isUpdating = true;
          (proxy as any).value = hasRaw ? { value: v } : v;
          nextTick(() => (isUpdating = false));
        }
      });
      watch(
        proxy,
        (v) => {
          const get = getter();
          if (!isUpdating && ((hasRaw ? v.value !== get && v.raw !== get : v !== get) || deep)) {
            if (extraData && setByExtra) setByExtra(extraData, v, hasRaw ? v.raw : v);
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
          if (extraData && setByExtra) setByExtra(extraData, value, value);
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
  <P extends Record<string | symbol, unknown>, K extends keyof P = DK>(
    props: P,
    options?: UseModelOptions<P, K, true, true>,
  ): Ref<{ value: UnwrapRef<P[K]>; raw?: any }>;
}
