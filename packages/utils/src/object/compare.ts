import { isArray } from '../is';
import { runIfFn } from '../function';
import { arrayFrom } from '../array';

export function simpleObjectEquals(obj1: any, obj2: any, depths = Infinity): boolean {
  if (Object.is(obj1, obj2) || (obj1 == null && obj2 == null)) return true;
  if (obj1 && obj2 && typeof obj1 === 'object' && typeof obj2 === 'object' && depths) {
    const keys = new Set(Object.keys(obj1).concat(Object.keys(obj2)));
    return arrayFrom(keys).every((key) => simpleObjectEquals(obj1[key], obj2[key], depths - 1));
  }
  return false;
}

export type ObjectCompareOption = {
  callback?: (obj1Val: any, obj2Val: any, path: string[]) => void;
  looseNull?: boolean;
  /** useful when you want to get all the different paths and values of two objects */
  noEarlyBreak?: boolean;
};

export function objectCompare(obj1: any, obj2: any, options?: ObjectCompareOption) {
  const map = new Map<Object, string[]>();
  const result = objectCompareWithPath(obj1, obj2, [], map, options);
  map.clear();
  return result;
}

function objectCompareWithPath(
  obj1: any,
  obj2: any,
  path: string[],
  map: Map<Object, string[]>,
  options?: ObjectCompareOption,
) {
  if (Object.is(obj1, obj2)) return true;
  if (options?.looseNull && obj1 == null && obj2 == null) return true;
  if (obj1 && obj2 && typeof obj1 === 'object' && typeof obj2 === 'object') {
    const obj1Path = map.get(obj1),
      obj2Path = map.get(obj2);
    if (obj1Path || obj2Path) return obj1Path === obj2Path; // circular
    const keys = new Set(Object.keys(obj1).concat(Object.keys(obj2)));
    let result = true;
    map.set(obj1, path);
    map.set(obj2, path);
    for (const key of keys) {
      if (!objectCompareWithPath(obj1[key], obj2[key], [...path, key], map, options)) {
        result = false;
        if (!options?.noEarlyBreak) break;
      }
    }
    return result;
  }
  runIfFn(options?.callback, obj1, obj2, path);
  return false;
}

export function shallowArrayEquals(arr1: any, arr2: any, isEqual = (i: any, j: any) => i === j): boolean {
  if (!isArray(arr1) || !isArray(arr2) || arr1.length !== arr2.length) return false;
  if (arr1 === arr2) return true;
  for (let i = 0; i < arr1.length; i++) {
    if (!isEqual(arr1[i], arr2[i])) return false;
  }
  return true;
}
