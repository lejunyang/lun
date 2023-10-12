import { isFunction, isObject } from '@lun/utils';

export type MaybeRefLikeOrGetter<T> =
  | { value: T | null | undefined }
  | { current: T | null | undefined }
  | (() => T | undefined | null);
export function unrefOrGet<Target, T = Target extends MaybeRefLikeOrGetter<infer A> ? A : never>(
  target: Target,
  defaultValue?: T
): T | undefined | null {
  if (isObject(target)) {
    if ('value' in target) return target.value as T;
    else if ('current' in target) return target.current as T;
  } else if (isFunction(target)) return target();
  if (defaultValue !== undefined) return defaultValue;
}