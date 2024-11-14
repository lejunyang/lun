import { isFunction, isSet } from './is';

const getSupport = (method: string) => isFunction((Set.prototype as any)[method]);

const supportIntersect = getSupport('intersection'),
  supportDiff = getSupport('difference'),
  supportUnion = getSupport('union');

export function intersectionOfSets<T1, T2>(set1: Set<T1>, set2: Set<T2>): Set<T1 & T2> {
  if (supportIntersect) {
    // @ts-ignore
    return set1.intersection(set2) as Set<any>;
  } else {
    let smaller: Set<any>;
    const res = new Set<any>(),
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

function _process(set1: Set<any>, set2: Set<any>, /** 1: clone bigger one; falsy: clone set1 */ clone?: number) {
  if (!clone) set1 = new Set(set1);
  let smallerOne: Set<any>,
    biggerOne: Set<any> = set1.size >= set2.size ? ((smallerOne = set2), set1) : ((smallerOne = set1), set2);
  return [smallerOne, clone ? new Set(biggerOne) : biggerOne, set1] as const;
}

export function differenceOfSets<T>(set1: Set<T>, set2: Set<unknown>): Set<T> {
  if (supportDiff) {
    // @ts-ignore
    return set1.difference(set2) as T;
  } else {
    const [smaller, bigger, res] = _process(set1, set2);
    for (const item of smaller) {
      if (bigger.has(item)) res.delete(item);
    }
    return res;
  }
}

export function unionOfSets<T1, T2>(set1: Set<T1>, set2: Set<T2>): Set<T1 | T2> {
  if (supportUnion)
    // @ts-ignore
    return set1.union(set2);
  const [smaller, bigger] = _process(set1, set2, 1);
  for (const item of smaller) {
    bigger.add(item);
  }
  return bigger;
}
