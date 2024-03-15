import {
  greaterThan,
  isNumber,
  isPlainNumber,
  lessThan,
  numbersEqual,
  BigIntDecimal,
  toBigIntDecimal,
} from '@lun/utils';

export type MathMethods<W = number, T = W | number> = {
  // ----------------- do not correct param type -----------------
  isNumber(target: unknown): target is T;
  isNaN(target: unknown): boolean;
  isZero(target: unknown): boolean;
  isFinite(target: unknown): boolean;
  isInteger(target: unknown): boolean;
  // ----------------- do not correct type -----------------

  // to js number or custom number type. be sure to return NaN if target is null or undefined
  toNumber(target: unknown): W;
  // to js number only
  toRawNum(target: unknown): number;
  toPrecision(target: T, precision: T): W;
  getZero(): W;
  getNaN(): W;
  getPositiveInfinity(): W;
  getNegativeInfinity(): W;

  // below can correct param type
  plus(target: T, delta: T): W;
  minus(target: T, delta: T): W;
  multi(target: T, delta: T): W;
  divide(target: T, delta: T): W;
  max(...args: T[]): W;
  min(...args: T[]): W;
  mod: (target: T, delta: T) => W;
  floor(target: T): W;
  equals(left: T, right: T): boolean;
  greaterThan(left: T, right: T): boolean;
  lessThan(left: T, right: T): boolean;

  // optional
  greaterThanOrEqual?: (left: T, right: T) => boolean;
  lessThanOrEqual?: (left: T, right: T) => boolean;
  ensureNumber?: (target: unknown, defaultVal: T) => W;
  toNumberOrNull?: (target: unknown) => W | null;
  negate?: (target: T) => W;
  abs?: (target: T) => W;
};

export function createMath<T = number>(methods: MathMethods<T>) {
  const { greaterThan, lessThan, equals, toNumber, isNaN } = methods;
  if (!methods.greaterThanOrEqual)
    methods.greaterThanOrEqual = (left, right) => greaterThan(left, right) || equals(left, right);
  if (!methods.lessThanOrEqual) methods.lessThanOrEqual = (left, right) => lessThan(left, right) || equals(left, right);
  if (!methods.ensureNumber)
    methods.ensureNumber = (target, defaultVal) => {
      const result = toNumber(target);
      return isNaN(result) ? toNumber(defaultVal) : result;
    };
  if (!methods.toNumberOrNull)
    methods.toNumberOrNull = (target) => {
      const result = toNumber(target);
      return isNaN(result) ? null : result;
    };
  if (!methods.negate)
    methods.negate = (target) => {
      if (methods.isZero(target)) return toNumber(target);
      return methods.minus(methods.getZero(), target);
    };
  if (!methods.abs)
    methods.abs = (target) => (methods.lessThanOrEqual!(target, 0) ? methods.negate!(target) : (target as T));
  return methods as Required<MathMethods<T>>;
}

export const createDefaultMath = () =>
  createMath({
    isNumber: isNumber as typeof isPlainNumber,
    isNaN: Number.isNaN,
    isZero: (target) => target === 0,
    toNumber: (target) => (target == null ? NaN : Number(target)),
    toRawNum: (target) => Number(target),
    getZero: () => 0,
    getNaN: () => Number.NaN,
    getPositiveInfinity: () => Number.POSITIVE_INFINITY,
    getNegativeInfinity: () => Number.NEGATIVE_INFINITY,
    isFinite: Number.isFinite,
    isInteger: Number.isInteger,
    plus: (target, delta) => target + delta,
    minus: (target, delta) => target - delta,
    multi: (target, delta) => target * delta,
    divide: (target, delta) => target / delta,
    mod: (target, delta) => target % delta,
    max: Math.max,
    min: Math.min,
    floor: Math.floor,
    equals: numbersEqual,
    greaterThan,
    lessThan,
    toPrecision: (target, precision) => +target.toFixed(precision),
    negate: (target) => -target,
  });

const is = (target: unknown): target is BigIntDecimal => target instanceof BigIntDecimal;
export const createBigIntDecimalMath = () =>
  createMath<BigIntDecimal>({
    isNumber: (target): target is number | BigIntDecimal => isNumber(target) || is(target),
    isNaN(target) {
      return is(target) ? target.isNaN() : Number.isNaN(target);
    },
    isZero(target) {
      return is(target) ? target.isZero() : target === 0;
    },
    toNumber: toBigIntDecimal,
    toRawNum(target) {
      return is(target) ? target.toNumber() : Number(target);
    },
    getZero: () => toBigIntDecimal({ integer: '0' }),
    getNaN: () => toBigIntDecimal({ nan: true }),
    getPositiveInfinity: () => toBigIntDecimal({ infinite: true }),
    getNegativeInfinity: () => toBigIntDecimal({ infinite: true, negative: true }),
    isFinite(target) {
      return is(target) ? !target.isInfinite() : Number.isFinite(target);
    },
    isInteger(target) {
      return is(target) ? target.isInteger() : Number.isInteger(target);
    },
    plus: (target, delta) => toBigIntDecimal(target).plus(delta),
    minus: (target, delta) => toBigIntDecimal(target).minus(delta),
    multi: (target, delta) => toBigIntDecimal(target).multi(delta),
    divide(target, delta) {
      return toBigIntDecimal(this.toRawNum(target) / this.toRawNum(delta));
    },
    mod: (target, delta) => toBigIntDecimal(target).mod(delta),

    max(...args) {
      if (!args.length) return this.getNegativeInfinity();
      let max = args[0];
      for (let i of args) {
        i = toBigIntDecimal(i);
        if (i.isInvalidate() || (i.infinite && !i.negative)) return i;
        else if (i.greaterThan(max)) max = i;
      }
      return toBigIntDecimal(max);
    },

    min(...args) {
      if (!args.length) return this.getPositiveInfinity();
      let min = args[0];
      for (let i of args) {
        i = toBigIntDecimal(i);
        if (i.isInvalidate() || (i.infinite && i.negative)) return i;
        else if (i.lessThan(min)) min = i;
      }
      return toBigIntDecimal(min);
    },

    floor(target) {
      return toBigIntDecimal(target).toFloor();
    },
    equals: (left, right) => toBigIntDecimal(left).equals(right),
    greaterThan(left, right) {
      return !!toBigIntDecimal(left).greaterThan(right);
    },
    lessThan(left, right) {
      return !!toBigIntDecimal(left).lessThan(right);
    },
    toPrecision(target, precision) {
      return toBigIntDecimal(target).toPrecision(precision);
    },
    negate(target) {
      return toBigIntDecimal(target).negated();
    },
  });
