import { ExcludeNumberAndSymbol, GetFunctionKeys } from '../type';
import { isFunction, isObject } from '../is';

function internalFlatten(currentObj: Record<string, unknown>, topObj: Record<string, unknown>, prefix = '') {
  return Object.entries(currentObj).forEach(([key, value]) => {
    if (isObject(value)) internalFlatten(value as Record<string, unknown>, topObj, `${prefix}${key}.`);
    else topObj[`${prefix}${key}`] = value;
  });
}

/**
 * flatten an object，e.g. { a: { b: [{ c: 1}] }, d: [1, 2] } => { 'a.b.0.c': 1, 'd.0': 1, 'd.1': 2 }
 */
export function flattenObject(obj: Record<string, unknown>): Record<string, unknown> {
  const result = {};
  internalFlatten(obj, result);
  return result;
}

export function fromObject<
  O extends Record<string, unknown>,
  K extends ExcludeNumberAndSymbol<keyof O> = ExcludeNumberAndSymbol<keyof O>,
  V extends any = O[K],
>(obj: O, fn: (key: K, value: V) => [string | number | symbol, unknown] | undefined) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      // @ts-ignore
      return fn(k, v) || [k, v];
    }),
  );
}

export function createBinds<T extends object, K extends GetFunctionKeys<T> = GetFunctionKeys<T>>(obj: T, keys: K[]) {
  return keys.reduce((acc, key) => {
    const val = obj[key];
    if (isFunction(val)) acc[key] = val.bind(obj);
    return acc;
  }, {} as { [P in K]: T[P] });
}
