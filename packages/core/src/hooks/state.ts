import { isFunction } from '@lun/utils';
import { computed, ref, shallowRef, watchEffect, WatchOptionsBase } from 'vue';

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
 * return a writable computed which is compatible with promise, if you set the value with promise, the value will not change until the promise resolve or reject
 * @param maybeGetter
 * @param fallbackWhenReject
 * @returns
 */
export function usePromiseRef<MT, T = MT extends MaybePromiseOrGetter<infer R> ? R : never>(
  maybeGetter: MT,
  options?: { fallbackWhenReject?: (err: any) => T }
) {
  const { fallbackWhenReject } = options || {};
  const local = ref<T>();
  const handlePromise = (maybePromise: any) => {
    if (maybePromise instanceof Promise) {
      Promise.resolve(maybePromise)
        .then((val) => {
          local.value = val;
        })
        .catch((e) => {
          if (isFunction(fallbackWhenReject)) local.value = fallbackWhenReject(e);
        });
    } else local.value = maybePromise;
  };
  const result = computed({
    get() {
      return local.value;
    },
    set: handlePromise,
  });
  watchEffect(() => {
    handlePromise(isFunction(maybeGetter) ? maybeGetter() : maybeGetter);
  });
  return result;
}

export type MaybePromise<T> = T | Promise<T>;
export type MaybePromiseOrGetter<T> = MaybePromise<T> | (() => MaybePromise<T>);
