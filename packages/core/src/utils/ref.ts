import { isFunction, isObject } from '@lun/utils';

export type MaybeRefLikeOrGetter<T, Ensure extends boolean = false> =
  | { value: Ensure extends true ? T : T | null | undefined }
  | { current: Ensure extends true ? T : T | null | undefined }
  | (() => Ensure extends true ? T : T | undefined | null);
export function unrefOrGet<
  Target,
  T = Target extends MaybeRefLikeOrGetter<infer A, infer E> ? (E extends true ? A : A | undefined | null) : never
>(target: Target, defaultValue?: T): T {
  if (isObject(target)) {
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