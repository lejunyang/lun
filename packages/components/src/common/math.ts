export type MathMethods<T = number> = {
  isNumber(target: unknown): target is T;
  isNaN(target: unknown): boolean;
  isZero(target: unknown): boolean;
  toNumber(target: unknown): T;
  plus(target: T, delta: T): T;
  minus(target: T, delta: T): T;
  max(...args: T[]): T;
  min(...args: T[]): T;
  equals(target: T, other: T): boolean;
  greaterThan(target: T, other: T): boolean;
  lessThan(target: T, other: T): boolean;
};

export function createMath<T = number>(methods: MathMethods<T>) {
  return methods;
}
