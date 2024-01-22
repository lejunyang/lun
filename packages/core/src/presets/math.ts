import { greaterThan, isNumber, isPlainNumber, lessThan, numbersEqual } from '@lun/utils';

export type MathMethods<T = number> = {
  isNumber(target: unknown): target is T;
  isNaN(target: unknown): boolean;
  isZero(target: unknown): boolean;
  toNumber(target: unknown): T;
  getZero(): T;
  getNaN(): T;
  getPositiveInfinity(): T;
  getNegativeInfinity(): T;
  isFinite(target: unknown): boolean;
  plus(target: T, delta: T): T;
  minus(target: T, delta: T): T;
  multiply(target: T, delta: T): T;
  divide(target: T, delta: T): T;
  max(...args: T[]): T;
  min(...args: T[]): T;
  floor(target: T): T;
  equals(left: T, right: T): boolean;
  greaterThan(left: T, right: T): boolean;
  lessThan(left: T, right: T): boolean;
  toPrecision(target: T, precision: number): T;

  // optional
  greaterThanOrEqual?: (left: T, right: T) => boolean;
  lessThanOrEqual?: (left: T, right: T) => boolean;
  ensureNumber?: (target: unknown, defaultVal: T) => T;
  toNumberOrNull?: (target: unknown) => T | null;
  toNegative(target: T): T;
};

export function createMath<T = number>(methods: MathMethods<T>) {
  const { greaterThan, lessThan, equals, toNumber, isNaN } = methods;
  if (!methods.greaterThanOrEqual)
    methods.greaterThanOrEqual = (left, right) => greaterThan(left, right) || equals(left, right);
  if (!methods.lessThanOrEqual) methods.lessThanOrEqual = (left, right) => lessThan(left, right) || equals(left, right);
  if (!methods.ensureNumber)
    methods.ensureNumber = (target, defaultVal) => {
      const result = toNumber(target);
      return isNaN(result) ? defaultVal : result;
    };
  if (!methods.toNumberOrNull)
    methods.toNumberOrNull = (target) => {
      const result = toNumber(target);
      return isNaN(result) ? null : result;
    };
  return methods as Required<MathMethods<T>>;
}

export const createDefaultMath = () =>
  createMath({
    isNumber: isNumber as typeof isPlainNumber,
    isNaN: Number.isNaN,
    isZero: (target) => target === 0,
    toNumber: (target) => Number(target),
    getZero: () => 0,
    getNaN: () => Number.NaN,
    getPositiveInfinity: () => Number.POSITIVE_INFINITY,
    getNegativeInfinity: () => Number.NEGATIVE_INFINITY,
    isFinite: Number.isFinite,
    plus: (target, delta) => target + delta,
    minus: (target, delta) => target - delta,
    multiply: (target, delta) => target * delta,
    divide: (target, delta) => target / delta,
    max: Math.max,
    min: Math.min,
    floor: Math.floor,
    equals: numbersEqual,
    greaterThan,
    lessThan,
    toPrecision: (target, precision) => +target.toFixed(precision),
    toNegative: (target) => -target,
  });
