import { FUNC, NUM, OBJ, STR } from './_internal';
import { globalObject } from './get';
// import { objectKeys } from './object/value';

export function getTypeTag(variable: unknown) {
  return Object.prototype.toString.call(variable).slice(8, -1);
}

export function isPromiseByTag(promise: unknown): promise is Promise<unknown> {
  return getTypeTag(promise) === 'Promise';
}

export function isObject(target: unknown): target is Object {
  return typeof target === OBJ && target !== null;
}

export function isObjectByTag(target: unknown): target is Object {
  return getTypeTag(target) === 'Object';
}

export function isNil(target: unknown): target is null | undefined {
  return target === null || target === undefined;
}

export function isPlainString(target: unknown): target is string {
  return typeof target === STR;
}

export function isString(target: unknown): target is string | String {
  return isPlainString(target) || target instanceof String;
}

export function isArray(target: unknown): target is Array<unknown> {
  return Array.isArray(target);
}

export function isNilOrEmptyStr(target: unknown): target is null | undefined | '' {
  return isNil(target) || target === '';
}

export function isFunction(target: unknown): target is Function {
  return typeof target === FUNC;
}

export function isEmpty(target: unknown) {
  if (isNil(target)) return true;
  if (isString(target) || isArray(target)) return !target.length;
  if (isSet(target) || isMap(target)) return !(target as Set<unknown> | Map<unknown, unknown>).size;
  // TODO temporarily remove objectKeys because of circular dependency in vitest
  if (isObject(target)) return !Object.keys(target).length;
  return false;
}

export function isTruthyOrZero(target: unknown) {
  return target || target === 0;
}

export function isPlainNumber(target: unknown): target is number {
  return typeof target === NUM;
}

export function isNumber(target: unknown): target is number | Number {
  return isPlainNumber(target) || target instanceof Number;
}

const createIs = <T>(type: keyof typeof globalThis) => {
  return (target: unknown): target is T => {
    return target instanceof globalObject[type] || getTypeTag(target) === type;
  };
};

export const isRegExp = createIs<RegExp>('RegExp');
export const isSet = createIs<Set<unknown>>('Set');
export const isMap = createIs<Map<unknown, unknown>>('Map');
