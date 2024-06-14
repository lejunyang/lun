import { AnyObject, isArray, isFunction, isObjectByTag } from '@lun/utils';
import { computed, isRef } from 'vue';

export type MaybeRefLikeOrGetter<T, Ensure extends boolean = false> =
  | T
  | { value: Ensure extends true ? T : T | null | undefined }
  | { current: Ensure extends true ? T : T | null | undefined }
  | (() => Ensure extends true ? T : T | undefined | null);

export function unrefOrGet<T>(target: MaybeRefLikeOrGetter<T, true>): T;

export function unrefOrGet<T>(target: MaybeRefLikeOrGetter<T, false>): T | undefined | null;

export function unrefOrGet<
  Target extends MaybeRefLikeOrGetter<any>,
  T = Target extends MaybeRefLikeOrGetter<infer A> ? A : never,
>(target: Target, defaultValue: T): T;

export function unrefOrGet<
  Target extends MaybeRefLikeOrGetter<any>,
  T = Target extends MaybeRefLikeOrGetter<infer A, infer E> ? (E extends false ? A | undefined | null : A) : never,
>(target: Target, defaultValue?: T): T {
  const getP = Object.getOwnPropertyDescriptor;
  // use tag to check if it's an object, in case that target is something like HTMLInputElement
  if (isObjectByTag(target)) {
    if (isRef(target) || getP(target, 'value')?.get || getP(Object.getPrototypeOf(target), 'value'))
      return (target as any).value as T;
    else if ('current' in target && Reflect.ownKeys(target).length === 1) return target.current as T;
  } else if (isFunction(target)) return target();
  if (defaultValue !== undefined) return defaultValue;
  return target as any;
}

/**
 * unref or get first truthy value in targets
 */
export function unrefOrGetMulti<Targets extends MaybeRefLikeOrGetter<any>[]>(
  ...targets: Targets
): (Targets[number] extends MaybeRefLikeOrGetter<infer A> ? A : never) | undefined {
  for (const t of targets) {
    const v = unrefOrGet(t);
    if (v) return v;
  }
}

export function unrefOrGetState<T extends MaybeRefLikeOrGetter<any>[] | MaybeRefLikeOrGetter<any>>(
  target: T,
):
  | (T extends MaybeRefLikeOrGetter<any>[]
      ? T[number] extends MaybeRefLikeOrGetter<infer A>
        ? A
        : never
      : T extends MaybeRefLikeOrGetter<infer A>
      ? A
      : never)
  | undefined {
  // @ts-ignore
  return isArray(target) ? unrefOrGetMulti(...target) : unrefOrGet(target);
}

export type ToAllMaybeRefLike<T extends {}, EnsuredKeys extends keyof T = never> = { [k in keyof T]: MaybeRefLikeOrGetter<T[k], k extends EnsuredKeys ? true : false> };
export type ToMaybeRefLike<T extends {}, Excluded extends keyof T = never, Remaining extends keyof T = Exclude<keyof T, Excluded>> = {
  [k in Remaining]: T[k] | MaybeRefLikeOrGetter<T[k]>;
} & { [k in Excluded]: T[k] };

export function mergeRef(...args: ({ value: any } | { current: any } | ((r: any) => void))[]) {
  return (r: any) => {
    args.forEach((arg) => {
      if (isFunction(arg)) arg(r);
      else if ('value' in arg) arg.value = r;
      else if ('current' in arg) arg.current = r;
    });
  };
}

export function refLikeToDescriptors<M extends Record<string | number | symbol, MaybeRefLikeOrGetter<any>>>(obj: M) {
  const descriptors: PropertyDescriptorMap = {};
  for (const key in obj) {
    descriptors[key] = {
      get() {
        return unrefOrGet(obj[key]);
      },
    };
  }
  return descriptors as Record<keyof M, PropertyDescriptor>;
}

export function refLikesToGetters<M extends Record<string | number | symbol, MaybeRefLikeOrGetter<any>>>(obj: M) {
  return Object.defineProperties({}, refLikeToDescriptors(obj)) as {
    readonly [k in keyof M]: ReturnType<typeof unrefOrGet<M[k]>>;
  };
}

export function refToGetter<T extends { value: object } | undefined | null>(
  target: T,
): T extends { value: infer V } ? Readonly<V> : {} {
  if (!target) return {} as any;
  return new Proxy(target, {
    get(target, key) {
      return (target.value as any)?.[key];
    },
    ownKeys(target) {
      return Reflect.ownKeys(target.value || {});
    },
    getOwnPropertyDescriptor(target, key) {
      return Reflect.getOwnPropertyDescriptor(target.value || {}, key);
    },
    set: () => false,
  }) as any;
}

/** similar to vue's computed, but wrapped with a proxy, so we don't need .value anymore, only use it when getter returns a object */
export function objectComputed<T extends AnyObject>(getter: () => T) {
  return refToGetter(computed(getter));
}
