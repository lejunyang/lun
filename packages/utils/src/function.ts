import { isFunction } from './is';
import { AnyFn, EnsureParameters } from './type';

export const cacheStringFunction = <T extends (str: string) => string>(fn: T): T => {
  const cache: Record<string, string> = Object.create(null);
  return ((str: string) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  }) as T;
};

export const cacheFunctionResult = <T extends (...args: any[]) => any>(fn: T) => {
  let cache: ReturnType<T>;
  return (...args: Parameters<T>): ReturnType<T> => {
    if (cache != null) return cache;
    else return (cache = fn(...args));
  };
};

export function runIfFn<T, Args extends unknown[] = EnsureParameters<T>>(
  target?: T,
  ...args: Args
): T extends AnyFn ? ReturnType<T> : T {
  return isFunction(target) ? target(...args) : target;
}
