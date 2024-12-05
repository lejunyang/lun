import { isFunction, runIfFn, ensureArray, globalObject } from '@lun-web/utils';
import { computed, ref, shallowRef, watchEffect, Ref, watch, WatchOptions, ComputedGetter } from 'vue';
import { createUnrefCalls, MaybeRefLikeOrGetter, unrefOrGet } from '../utils/ref';

/**
 * create a temporary ref，which means ref value is initialized with getter and you can change it as you want, but it will reset the value when getter updates
 * @param getter
 * @param options
 * @returns
 */
export function useTempState<T>(
  getter: () => T,
  options?: WatchOptions & { deepRef?: boolean; shouldUpdate?: () => boolean },
) {
  const { deep, deepRef, shouldUpdate } = options || {};
  let temp = getter();
  const local = deep || deepRef ? ref<T>(temp) : shallowRef<T>(temp);
  const changed = computed(() => {
    if (local.value !== temp) {
      return (changedOnce.value = true);
    } else return false;
  });
  const changedOnce = shallowRef(false);
  const reset = (val: any) => {
    changedOnce.value = false;
    return (local.value = temp = val || getter());
  };
  watch(
    () => {
      if (shouldUpdate?.() === false) return temp;
      return (temp = getter());
    },
    reset,
    options,
  );
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
  }) as any as Ref<T> & { reset: (newVal?: any) => T; readonly changed: boolean; readonly changedOnce: boolean };
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
  options?: { fallbackWhenReject?: (err: any) => T; onCancel?: () => void; fnArgs?: MaybeRefLikeOrGetter<any> },
) {
  const { fallbackWhenReject, onCancel, fnArgs } = options || {};
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
    handlePromise(runIfFn<any>(unrefOrGet(maybeGetter), ...ensureArray(unrefOrGet(fnArgs))));
  });
  return [result, pending] as const;
}

export type MaybePromise<T> = T | Promise<T>;
export type MaybePromiseOrGetter<T> = MaybePromise<T> | (() => MaybePromise<T>);

/** it's for computed that always returns a new value in getter(like return an object literal). return a same old value to cache the result so that it won't trigger other effects */
export function cacheComputed<T>(getter: (oldVal?: NoInfer<T>) => T, shouldUpdate?: (oldVal: NoInfer<T>) => boolean) {
  let cache: T;
  return computed<T>(() => {
    if (cache === undefined || !shouldUpdate || shouldUpdate(cache)) return (cache = getter(cache));
    else return cache;
  });
}

export function fComputed<T>(get: ComputedGetter<T>) {
  const res = computed(get);
  return () => res.value;
}

const createUseSetOrMap =
  <TStr extends 'Set' | 'Map' | 'WeakSet' | 'WeakMap', T = InstanceType<(typeof globalThis)[TStr]>>(type: TStr) =>
  () => {
    const constructor = globalObject[type] as any,
      result = ref<T>(new constructor()),
      isSet = type === 'Set' || type === 'WeakSet';
    // @ts-expect-error
    const binds = createUnrefCalls(result, 'add', 'has', 'set', 'get', 'delete', 'forEach') as any,
      replace = (newObj: T = new constructor()) => (result.value = newObj);
    return Object.assign(result, {
      replace,
      [Symbol.iterator]: function* () {
        yield replace;
        yield isSet ? binds.has : binds.get;
        yield isSet ? binds.add : binds.set;
        yield binds.delete;
      },
      ...binds,
    });
  };

type SetOrMap = Set<any> | WeakSet<any> | Map<any, any> | WeakMap<any, any>;
type GetIterateMethods<T extends SetOrMap, Methods> = T extends Set<any> | WeakSet<any>
  ? // @ts-expect-error
    [replace: Methods['replace'], has: Methods['has'], add: Methods['add'], del: Methods['delete']]
  : T extends Map<any, any> | WeakMap<any, any>
  ? // @ts-expect-error
    [replace: Methods['replace'], get: Methods['get'], set: Methods['set'], del: Methods['delete']]
  : never;

type GetIterableRefWithMethods<
  T extends SetOrMap,
  M extends readonly string[],
  K extends keyof T = M[number] extends keyof T ? M[number] : never,
  Methods = Pick<T, K> & { replace: (newObj?: T) => T },
> = Ref<T> & Methods & GetIterateMethods<T, Methods>;

/**
 * create a Set ref with add, has, delete, forEach and replace(replace ref's value with a new Set) methods, the ref is also an iterable object containing [replace, has, add, delete] methods
 */
export const useSet = createUseSetOrMap('Set') as any as <K>() => GetIterableRefWithMethods<
  Set<K>,
  ['add', 'has', 'delete', 'forEach']
>;

/**
 * create a WeakSet ref with add, has, delete and replace(replace ref's value with a new WeakSet) methods, the ref is also an iterable object containing [replace, has, add, delete] methods
 */
export const useWeakSet = createUseSetOrMap('WeakSet') as any as <K extends WeakKey>() => GetIterableRefWithMethods<
  WeakSet<K>,
  ['add', 'has', 'delete']
>;

/**
 * create a Map ref with get, has, set, delete, forEach and replace(replace ref's value with a new Map) methods, the ref is also an iterable object containing [replace, get, set, delete] methods
 */
export const useMap = createUseSetOrMap('Map') as any as <K, V>() => GetIterableRefWithMethods<
  Map<K, V>,
  ['get', 'has', 'set', 'delete', 'forEach']
>;

/**
 * create a WeakMap ref with get, has, set, delete and replace(replace ref's value with a new WeakMap) methods, the ref is also an iterable object containing [replace, get, set, delete] methods
 */
export const useWeakMap = createUseSetOrMap('WeakMap') as any as <K extends WeakKey, V>() => GetIterableRefWithMethods<
  WeakMap<K, V>,
  ['get', 'has', 'set', 'delete']
>;
