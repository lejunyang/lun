import { isArray, isFunction, isString } from './is';

export function toArrayIfNotNil<T>(
  target: T,
): T extends Array<infer E> ? E[] : T extends null | undefined ? never : T[] {
  return (isArray(target) ? target : target == null ? [] : [target]) as any;
}

export function toArrayIfTruthy<T>(
  target: T,
): T extends Array<infer E> ? E[] : T extends null | undefined | false | '' ? never : T[] {
  return (isArray(target) ? target : target ? [target] : []) as any;
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
    else if (isIterable(arg)) Array.from(arg).forEach((item) => item != null && result.add(item));
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
