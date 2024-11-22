import { isFunction } from './is';
import { AnyFn, EnsureParameters } from './type';

/*@__NO_SIDE_EFFECTS__*/
export const cacheStringFunction = <T extends (str: string) => string>(fn: T): T => {
  const cache: Record<string, string> = Object.create(null);
  return ((str: string) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  }) as T;
};

/**
 * cache the result of function, cache depends on the length of arguments
 * @param fn
 * @returns
 */
/*@__NO_SIDE_EFFECTS__*/
export const cacheFunctionResult = <T extends (...args: any[]) => any>(fn: T) => {
  const cache: ReturnType<T>[] = [];
  return ((...args: Parameters<T>): ReturnType<T> => {
    const hit = cache[args.length];
    if (hit != null) return hit;
    else return (cache[args.length] = fn(...args));
  }) as T;
};

export function runIfFn<T, Args extends EnsureParameters<T, any[]> = EnsureParameters<T, any[]>>(
  target: T,
  ...args: Args
): T extends AnyFn ? ReturnType<T> : T {
  return isFunction(target) ? target(...args) : (target as any);
}

export function once<T extends AnyFn>(fn: T): T {
  let called = false,
    result: ReturnType<T>;
  return function (this: any, ...args: Parameters<T>) {
    if (called) return result;
    called = true;
    return (result = fn.apply(this, args));
  } as T;
}

export function noop() {}
