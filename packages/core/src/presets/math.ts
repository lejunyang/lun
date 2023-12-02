import { greaterThan, isNumber, lessThan, numbersEqual } from '@lun/utils';

export type MathMethods<T = number> = {
  isNumber(target: unknown): target is T;
  isNaN(target: unknown): boolean;
  isZero(target: unknown): boolean;
  toNumber(target: unknown): T;
  plus(target: T, delta: T): T;
  minus(target: T, delta: T): T;
  max(...args: T[]): T;
  min(...args: T[]): T;
  equals(left: T, right: T): boolean;
  greaterThan(left: T, right: T): boolean;
  lessThan(left: T, right: T): boolean;

  // optional
  greaterThanOrEqual?: (left: T, right: T) => boolean;
  lessThanOrEqual?: (left: T, right: T) => boolean;
};

export function createMath<T = number>(methods: MathMethods<T>) {
  const { greaterThan, lessThan, equals } = methods;
  if (!methods.greaterThanOrEqual)
    methods.greaterThanOrEqual = (left, right) => greaterThan(left, right) || equals(left, right);
  if (!methods.lessThanOrEqual) methods.lessThanOrEqual = (left, right) => lessThan(left, right) || equals(left, right);
  return methods as Required<MathMethods<T>>;
}

export const createDefaultMath = () =>
  createMath({
    isNumber,
    isNaN: Number.isNaN,
    isZero: (target) => target === 0,
    toNumber: (target) => Number(target),
    // @ts-ignore
    plus: (target, delta) => target + delta,
    // @ts-ignore
    minus: (target, delta) => target - delta,
    max: Math.max,
    min: Math.min,
    equals: numbersEqual,
    greaterThan,
    lessThan,
  });
