export type MathMethods<T = number> = {
  isNumber(target: unknown): target is T;
  isNaN(target: unknown): boolean;
  toNumber(target: unknown): T;
  plus(target: T, delta: T): T;
  minus(target: T, delta: T): T;
  max(...args: T[]): T;
  min(...args: T[]): T;
};

export function createMath<T = number>(methods: MathMethods<T>) {
  return methods;
}
