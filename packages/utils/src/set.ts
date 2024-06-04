import { isFunction, isSet } from './is';

// @ts-ignore
const support = isFunction(Set.prototype.intersection);

export function intersection(set1: Set<any>, set2: Set<any>) {
  if (support) {
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

export function intersectOrHas<T>(set: Set<T>, value: Set<T> | T) {
  return isSet(value) ? !!intersection(set, value).size : set.has(value);
}
