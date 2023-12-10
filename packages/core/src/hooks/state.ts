import { isFunction, runIfFn } from '@lun/utils';
import { computed, ref, shallowRef, unref, watchEffect, WatchOptionsBase } from 'vue';

/**
 * create a temporary ref，which means ref value is initialized with getter and you can change it as you want, but it will reset the value when getter updates
 * @param getter
 * @param options
 * @returns
 */
export function useTempState<T>(getter: () => T, options?: WatchOptionsBase) {
  const local = shallowRef<T>(getter());
  watchEffect(() => {
    local.value = getter();
  }, options);
  return local;
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
  options?: { fallbackWhenReject?: (err: any) => T; onCancel?: () => void }
) {
  const { fallbackWhenReject, onCancel } = options || {};
  const local = ref<T>();
  let pending = false;
  const handlePromise = (maybePromise: any) => {
    maybePromise = unref(maybePromise);
    if (maybePromise instanceof Promise) {
      pending = true;
      Promise.resolve(maybePromise)
        .then((val) => {
          local.value = val;
        })
        .catch((e) => {
          if (isFunction(fallbackWhenReject)) local.value = fallbackWhenReject(e);
        })
        .finally(() => {
          pending = false;
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
      if (pending && isFunction(onCancel)) {
        onCancel();
      }
    });
    handlePromise(runIfFn(maybeGetter));
  });
  return result;
}

export type MaybePromise<T> = T | Promise<T>;
export type MaybePromiseOrGetter<T> = MaybePromise<T> | (() => MaybePromise<T>);
