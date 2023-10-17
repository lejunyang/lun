import { isObject } from '../is';

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