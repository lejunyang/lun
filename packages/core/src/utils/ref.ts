import { isFunction, isObjectByTag } from '@lun/utils';

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
  // use tag to check if it's an object, in case that target is something like HTMLInputElement
  if (isObjectByTag(target)) {
    if ('value' in target) return target.value as T;
    else if ('current' in target) return target.current as T;
  } else if (isFunction(target)) return target();
  if (defaultValue !== undefined) return defaultValue;
  return target as any;
}

export type ToRefLike<T extends {}> = { [k in keyof T]: MaybeRefLikeOrGetter<T[k]> };
export type ToMaybeRefLike<T extends {}, EX extends keyof T = never, M extends keyof T = Exclude<keyof T, EX>> = {
  [k in M]: T[k] | MaybeRefLikeOrGetter<T[k]>;
} & { [k in EX]: T[k] };

export function mergeRef(...args: ({ value: any } | { current: any } | ((r: any) => void))[]) {
  return (r: any) => {
    args.forEach((arg) => {
      if (isFunction(arg)) arg(r);
      else if ('value' in arg) arg.value = r;
      else if ('current' in arg) arg.current = r;
    });
  };
}

export function refLikeToGetters<M extends Record<string | number | symbol, MaybeRefLikeOrGetter<any>>>(obj: M) {
  const descriptors: PropertyDescriptorMap = {};
  for (const key in obj) {
    descriptors[key] = {
      get() {
        return unrefOrGet(obj[key]);
      },
    };
  }
  return Object.defineProperties({}, descriptors) as { readonly [k in keyof M]: ReturnType<typeof unrefOrGet<M[k]>> };
}
