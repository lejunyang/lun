import { isFunction, runIfFn } from '@lun/utils';
import { computed, ref, shallowRef, watchEffect, WatchOptionsBase, Ref } from 'vue';
import { unrefOrGet } from '../utils/ref';

/**
 * create a temporary ref，which means ref value is initialized with getter and you can change it as you want, but it will reset the value when getter updates
 * @param getter
 * @param options
 * @returns
 */
export function useTempState<T>(getter: () => T, options?: WatchOptionsBase) {
  let temp = getter();
  const local = shallowRef<T>(temp);
  const changed = computed(() => {
    if (local.value !== temp) {
      return (changedOnce.value = true);
    } else return false;
  });
  const changedOnce = shallowRef(false);
  const reset = () => {
    changedOnce.value = false;
    return (local.value = temp = getter());
  };
  watchEffect(reset, options);
  Object.defineProperties(local, {
    changed: {
      get() {
        return changed.value;
      },
    },
    changedOnce: {
      get() {
        changed.value; // need to access changed to trigger computed
        return changedOnce.value;
      },
    },
  });
  return Object.assign(local, {
    reset,
  }) as Ref<T> & { reset: () => T; readonly changed: boolean; readonly changedOnce: boolean };
}

/**
 * return a writable computed which is compatible with promise, if you set the value with promise, the value will not change until the promise resolve or reject\
 * Note that multiple change with promise in a short time could result conflict update
 * @param maybeGetter
 * @param fallbackWhenReject
 * @returns
 */
export function usePromiseRef<MT, T = MT extends MaybePromiseOrGetter<infer R> ? R : any>(
  maybeGetter: MT,
  options?: { fallbackWhenReject?: (err: any) => T; onCancel?: () => void },
) {
  const { fallbackWhenReject, onCancel } = options || {};
  const local = ref<T>();
  const pending = ref(false);
  const handlePromise = (maybePromise: any) => {
    if (maybePromise instanceof Promise) {
      pending.value = true;
      Promise.resolve(maybePromise)
        .then((val) => {
          local.value = val;
        })
        .catch((e) => {
          if (isFunction(fallbackWhenReject)) local.value = fallbackWhenReject(e);
        })
        .finally(() => {
          pending.value = false;
        });
    } else local.value = maybePromise;
  };
  const result = computed({
    get() {
      return local.value;
    },
    set: handlePromise,
  });
  watchEffect((onCleanup) => {
    onCleanup(() => {
      if (pending.value && isFunction(onCancel)) {
        onCancel();
      }
    });
    handlePromise(runIfFn(unrefOrGet(maybeGetter)));
  });
  return [result, pending] as const;
}

export type MaybePromise<T> = T | Promise<T>;
export type MaybePromiseOrGetter<T> = MaybePromise<T> | (() => MaybePromise<T>);
