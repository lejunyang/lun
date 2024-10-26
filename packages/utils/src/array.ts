import { isArray, isFunction, isNumber, isString } from './is';

export function ensureArray<T>(target: T): T extends Array<infer E> ? E[] : T extends null | undefined ? never : T[] {
  return (isArray(target) ? target : target == null ? [] : [target]) as any;
}

export function ensureTruthyArray<T>(
  target: T,
): T extends Array<infer E> ? E[] : T extends null | undefined | false | '' ? never : T[] {
  return ensureArray(target).filter(Boolean) as any;
}

export function isIterable<T>(target: any): target is Iterable<T> {
  return target != null && isFunction(target[Symbol.iterator]);
}

export type ExtractIterable<T> = T extends Iterable<infer E> ? E : never;

// https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export function toNoneNilSet<T extends (Iterable<any> | null | undefined)[]>(
  ...args: T
): Set<ExtractIterable<T[number]>> {
  const result = new Set();
  args.forEach((arg) => {
    if (isString(arg)) result.add(arg); // string is iterable
    else if (isIterable(arg)) arrayFrom(arg).forEach((item) => item != null && result.add(item));
    else if (arg != null) result.add(arg);
  });
  return result as any;
}

export function getFirstOfIterable<T>(iterable?: Iterable<T>): T | undefined {
  if (!isIterable(iterable)) return;
  for (const value of iterable) {
    return value;
  }
}

export function at<T>(arr: T[] | undefined | null, index: number): T | undefined {
  if (!arr) return;
  if (arr.at) return arr.at(index);
  const { length } = arr;
  // Array.prototype.at will perform integer conversion, Infinity as it is, NaN as 0
  index = Math.trunc(index) || 0;
  if (index < 0) index += length;
  if (index < 0 || index >= length) return undefined;
  return arr[index];
}

export function arrayFrom<V>(length: number): V[];
export function arrayFrom<V>(length: number, mapVal?: (val: undefined, index: number) => V): V[];
export function arrayFrom<T>(arr: ArrayLike<T> | Iterable<T>): T[];
export function arrayFrom<T, V>(arr: ArrayLike<T> | Iterable<T>, mapVal: (val: T, index: number) => V): V[];

/** simply like Array.from, but can take a number as the first argument to create an array of that length */
export function arrayFrom(lengthOrArrayLike: number | ArrayLike<any> | Iterable<any>, mapVal?: any) {
  return Array.from(isNumber(lengthOrArrayLike) ? { length: lengthOrArrayLike } : lengthOrArrayLike, mapVal);
}
