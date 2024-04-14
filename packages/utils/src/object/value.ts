import { isArray } from '../is';
import { stringToPath } from '../string';
import { MergeObjects } from './merge';

export interface ObjectGet {
  <T = any>(object: any, path?: string | (string | number | symbol)[]): T;
  <T = any>(object: any, path?: string | (string | number | symbol)[], defaultValue?: T): T;
}
/**
 *
 * @param object
 * @param path string like a.b[c][0].d，or array like ['a', 'b', 'c', 0, 'd']
 * @param defaultVal if result is undefined or null, return defaultVal
 */
export const objectGet: ObjectGet = (object: any, path?: string | (string | number | symbol)[], defaultVal?: any) => {
  if (object == null) return defaultVal ?? undefined;
  const newPath = isArray(path) ? path : stringToPath(path);
  if (!newPath.length) return defaultVal ?? undefined;
  return (
    newPath.reduce((o, k) => {
      if (o == null) return o;
      else return o[k];
    }, object) ?? defaultVal
  );
};

/**
 * assign a value to an object according to the path
 * {}, 'a[0].b', 1 => { a: [{ b: 1 }]}
 * { a: {} }, 'a[0].b', 1 => { a: [{ b: 1 }]}
 */
export function objectSet<T>(object: T, path: string | string[], value: any, ignoreOriginalValue = true) {
  if (!object || typeof object !== 'object') return object;
  const newPath = isArray(path) ? path : stringToPath(path);
  newPath.reduce((obj, p, i) => {
    const nextIsArray = Number.isInteger(+newPath[i + 1]);
    if (i === newPath.length - 1 && (ignoreOriginalValue || !(p in obj))) {
      obj[p] = value;
    } else if (!(p in obj) || typeof obj[p] !== 'object' || !obj[p]) {
      obj[p] = nextIsArray ? [] : {};
    } else if (nextIsArray && !isArray(obj[p])) {
      obj[p] = [];
    }
    return obj[p];
  }, object as any);
  return object;
}

export function pick<T extends Record<string | symbol, any>, K extends keyof T = keyof T>(obj: T, keys: K[]) {
  return keys.reduce((result, current) => {
    result[current] = obj[current];
    return result;
  }, {} as Pick<T, K>);
}

export function omit<T extends Record<string | symbol, any>, K extends keyof T = keyof T>(obj: T, keys: K[]) {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result as Omit<T, K>;
}

// @ts-ignore
export const hasOwn = Object.hasOwn || Object.prototype.hasOwnProperty.call;

/**
 * pick non-nil value from multiple objects
 */
export function pickNonNil<
  T extends (Record<string | symbol, any> | null | undefined)[],
  M = MergeObjects<T>,
  K extends (keyof M)[] = [],
>(keys: K, ...targets: T) {
  return keys.reduce((result, key) => {
    for (const target of targets) {
      if (target && (target as any)[key] != null) {
        result[key] = (target as any)[key];
        break;
      }
    }
    return result;
  }, {} as Pick<M, K[number]>);
}

/** it's annoying Object.keys() returns string[], use this instead */
export const objectKeys = <T extends object>(obj: T) => {
  return Object.keys(obj) as Array<keyof T>;
};

export function toGetterDescriptors<
  O extends object,
  K extends keyof O = keyof O,
  PM extends Partial<Record<K, string | number | symbol>> = Record<K, K>,
  PMK extends keyof PM = keyof PM,
  RemappedKey extends string | number | symbol = PM[PMK] extends string | number | symbol ? PM[PMK] : never,
>(
  obj: O,
  propertiesMap?: PM,
  get: (obj: O, k: K) => any = (obj, k) => obj[k],
): {
  [k in RemappedKey | Exclude<K, PMK>]: PropertyDescriptor;
} {
  const descriptors = {} as any;
  for (const key in obj) {
    const newKey = (propertiesMap as any)?.[key] || key;
    descriptors[newKey] = {
      get() {
        return get(obj, key as any);
      },
    };
  }
  return descriptors;
}