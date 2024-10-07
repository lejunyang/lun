import { isFunction, isSet } from './is';

const getSupport = (method: string) => isFunction((Set.prototype as any)[method]);

const supportIntersect = getSupport('intersection'),
  supportDiff = getSupport('difference');

export function intersectionOfSets(set1: Set<any>, set2: Set<any>) {
  if (supportIntersect) {
    // @ts-ignore
    return set1.intersection(set2) as Set<any>;
  } else {
    let smaller: Set<any>;
    const res = new Set(),
      bigger = set1.size > set2.size ? ((smaller = set2), set1) : ((smaller = set1), set2);
    for (const item of smaller) {
      if (bigger.has(item)) res.add(item);
    }
    return res;
  }
}

export function setIntersectOrHas<T>(set: Set<T>, value: Set<T> | T) {
  return isSet(value) ? !!intersectionOfSets(set, value).size : set.has(value);
}

export function differenceOfSets<T extends Set<any>>(set1: T, set2: T): T {
  if (supportDiff) {
    // @ts-ignore
    return set1.difference(set2) as T;
  } else {
    const res = new Set(set1);
    if (res.size <= set2.size)
      for (const item of res) {
        if (set2.has(item)) res.delete(item);
      }
    else
      for (const item of set2) {
        if (res.has(item)) res.delete(item);
      }
    return res as T;
  }
}
