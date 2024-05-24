import { isNumber, isString } from './is';

export function numbersEqual(num1: number, num2: number) {
  return Math.abs(num1 - num2) < Number.EPSILON; // 2^-52
}

export function greaterThan(num1: number, num2: number) {
  return num1 - num2 > Number.EPSILON;
}

export function lessThan(num1: number, num2: number) {
  return num2 - num1 > Number.EPSILON;
}

export function toNumberIfValid<T>(val: T, defaultVal?: number) {
  const num = +val;
  return val == null || Number.isNaN(num) ? (defaultVal != null ? defaultVal : val) : num;
}

export function toNumberOr<T>(val: any, defaultVal: T) {
  const num = +val;
  return Number.isNaN(num) ? defaultVal : num;
}

export function toNumberOrNull(val: any) {
  return toNumberOr(val, null);
}

export function toNumberOrUndefined(val: any) {
  return toNumberOr(val, undefined);
}

export function ensureNumber(val: any, defaultVal: number) {
  const num = toNumberOr(val, defaultVal);
  if (!isNumber(num)) return NaN;
  else return num;
}

export const numberRegex =
  /^(?<sign>[-+])?(?<integer>[0-9]*)(?<decimal>[.。][0-9]*)?((e|E)(?<expSign>[-+])?(?<exp>[0-9]*))?$/;

export type BigIntDecimalValue = string | number | BigIntDecimal | typeof BigIntDecimal;
export type BigIntDecimalConstructParam =
  | null
  | undefined
  | BigIntDecimalValue
  | {
      integer?: string;
      decimal?: string;
      negative?: boolean;
      exp?: string;
      expNegative?: boolean;
      infinite?: boolean;
      nan?: boolean;
      empty?: boolean;
    };

// derived from react-component/mini-decimal
export class BigIntDecimal {
  negative: boolean | undefined;
  integer: bigint = 0n;
  decimal: bigint = 0n;
  /** decimal may heave leading zeros, but BigInt will convert `0009` to `9`. we need record the len of decimal */
  decimalLen: number = 0;
  empty: boolean = false;
  nan: boolean = false;
  infinite: boolean = false;

  constructor(value: BigIntDecimalConstructParam) {
    if (value instanceof BigIntDecimal) {
      return toBigIntDecimal({
        integer: value.getIntegerStr(),
        decimal: value.getDecimalStr(),
        negative: value.negative,
        infinite: value.infinite,
        nan: value.nan,
        empty: value.empty,
      });
    } else if (isNumber(value) || isString(value)) {
      return this.initStrOrNum(value)!;
    }
    let { integer = '', decimal = '', negative, exp, expNegative, infinite, nan, empty } = (value || {}) as any;
    this.negative = negative;
    if (nan || (!integer && !decimal && infinite == null)) {
      this.nan = true;
      return;
    }
    if ((this.empty = empty) || (this.infinite = infinite)) return;
    decimal = decimal.replace(/0+$/, ''); // remove trailing zeros of decimal
    let decimalLen = decimal.length;
    const e = +exp!;
    if (exp && e !== 0) {
      if (__DEV__ && Number.isNaN(e)) throw new Error('Invalid exponent');
      if (expNegative) {
        decimal = integer.slice(-e) + decimal;
        integer = e > integer.length ? '' : integer.slice(0, integer.length - e);
        decimalLen += e;
      } else {
        if (e >= decimalLen) {
          integer += decimal + '0'.repeat(e - decimalLen);
          decimal = '';
          decimalLen = 0;
        } else {
          integer += decimal.slice(0, e);
          decimal = decimal.slice(e);
          decimalLen -= e;
        }
      }
    }
    this.integer = BigInt(integer);
    this.decimal = BigInt(decimal);
    this.decimalLen = decimalLen;
  }

  initStrOrNum(value: string | number) {
    if (Number.isNaN(value as number)) {
      this.nan = true;
      return;
    }
    value = String(value).trim();
    if (value === 'Infinity' || value === '+Infinity' || value === '-Infinity') {
      this.infinite = true;
      this.negative = value[0] === '-';
      return;
    }
    if (value === '') {
      this.empty = true;
      return;
    }
    const match = value.match(numberRegex);
    if (match?.groups) {
      let { sign, integer, decimal, exp, expSign } = match.groups;
      decimal = decimal?.slice(1) || '';
      if (!integer && !decimal) {
        this.nan = true;
        return;
      }
      return toBigIntDecimal({ integer, decimal, negative: sign === '-', exp, expNegative: expSign === '-' });
    } else this.nan = true;
  }

  getMark() {
    return this.negative ? '-' : '';
  }

  getIntegerStr() {
    return this.integer.toString();
  }

  getDecimalStr() {
    return this.decimalLen ? this.decimal.toString().padStart(this.decimalLen, '0') : '';
  }

  /**
   * @private Align BigIntDecimal with same decimal length. e.g. 12.3 > 5 => 1230000
   * This is used for plus function only.
   */
  alignDecimal(decimalLength: number): bigint {
    const str = `${this.getMark()}${this.getIntegerStr()}${this.getDecimalStr().padEnd(decimalLength, '0')}`;
    return BigInt(str);
  }

  negated() {
    const clone = toBigIntDecimal(this, true);
    clone.negative = !clone.negative;
    return clone;
  }

  private cal(
    offset: BigIntDecimal,
    calculator: (bigInt1: bigint, bigInt2: bigint) => bigint,
    calDecimalLen: (maxDecimalLength: number) => number,
  ): BigIntDecimal {
    const maxDecimalLength = Math.max(this.decimalLen, offset.decimalLen);
    const myAlignedDecimal = this.alignDecimal(maxDecimalLength);
    const offsetAlignedDecimal = offset.alignDecimal(maxDecimalLength);
    let nextDecimalLength = calDecimalLen(maxDecimalLength);

    const valueStr = calculator(myAlignedDecimal, offsetAlignedDecimal)
      .toString()
      .padStart(nextDecimalLength + 1, '0');
    // 1.001 + (-1) => 1001 + (-1000) => 1 => 0001
    const sliceIndex = -nextDecimalLength || valueStr.length; // correct nextDecimalLength if it's 0, it means the result is an integer
    const negative = valueStr[0] === '-';
    return toBigIntDecimal({
      integer: valueStr.slice(negative ? 1 : 0, sliceIndex),
      decimal: valueStr.slice(sliceIndex),
      negative,
    });
  }

  /**
   * @private
   * if this or target is infinite, return infinite; if this or target is NaN, return NaN; or return undefined
   */
  private check(value: BigIntDecimalValue) {
    const target = toBigIntDecimal(value);
    if (this.isInvalidate() || target.isInvalidate()) return toBigIntDecimal(NaN);
    else if (this.infinite || target.infinite) return toBigIntDecimal({ infinite: true });
  }

  plus(value: BigIntDecimalValue): BigIntDecimal {
    const target = toBigIntDecimal(value);
    let temp;
    if ((temp = this.check(target))) {
      if (temp.negative || target.negative) temp.nan = true;
      return temp;
    }
    return this.cal(
      target,
      (num1, num2) => num1 + num2,
      (len) => len,
    );
  }

  minus(value: BigIntDecimalValue): BigIntDecimal {
    return this.plus(toBigIntDecimal(value).negated());
  }

  multi(value: BigIntDecimalValue): BigIntDecimal {
    const target = toBigIntDecimal(value);
    let temp;
    if ((temp = this.check(target))) {
      // @ts-ignore
      temp.negative = temp.negative ^ target.negative;
      return temp;
    }
    return this.cal(
      target,
      (num1, num2) => num1 * num2,
      (len) => len * 2,
    );
  }

  div(value: BigIntDecimalValue, precision?: number): BigIntDecimal {
    const target = toBigIntDecimal(value);
    let temp;
    if ((temp = this.check(target))) {
      // @ts-ignore
      temp.negative = temp.negative ^ target.negative;
      return temp;
    }
    precision ??= Math.max(this.decimalLen, target.decimalLen, 10);
    if (!Number.isInteger(precision) || precision < 0) {
      if (__DEV__)
        console.error(
          `Invalid precision '${precision}', will return value of 'this'. Precision must be a non-negative integer. `,
        );
      return this;
    }
    return this.cal(
      target,
      (num1, num2) => {
        // for the fraction part, multiply the remainder with 10^precision to get the integer result
        const fraction = ((num1 % num2) * 10n ** BigInt(precision)) / num2;
        return BigInt((num1 / num2).toString() + fraction.toString());
      },
      () => precision,
    );
  }

  mod(value: BigIntDecimalValue): BigIntDecimal {
    const target = toBigIntDecimal(value);
    let temp;
    if ((temp = this.check(target))) {
      temp.nan = true;
      return temp;
    }
    return this.cal(
      target,
      (num1, num2) => num1 % num2,
      (len) => len,
    );
  }

  toFloor() {
    if (this.isInvalidate() || this.infinite) {
      return toBigIntDecimal(this, true);
    }
    // remove decimal part
    const temp = toBigIntDecimal({
      integer: this.getIntegerStr(),
      negative: this.negative,
    });
    if (this.negative) {
      // -1.1 => -2
      return temp.plus(
        toBigIntDecimal({
          integer: '1',
          negative: true,
        }),
      );
    }
    return temp;
  }

  toPrecision(_precision: BigIntDecimalValue) {
    _precision = toBigIntDecimal(_precision);
    if (!_precision.isInteger() || _precision.lessThan(0)) {
      if (__DEV__)
        console.error(
          `Invalid precision '${_precision.toString()}', will return value of 'this'. Precision must be a non-negative integer. `,
        );
      return this;
    }
    const precision = Number(_precision.integer);
    if (this.isInvalidate() || this.infinite || this.decimalLen <= precision) {
      return toBigIntDecimal(this, true);
    }
    const decimalStr = this.getDecimalStr();
    let decimal = decimalStr.slice(0, precision);
    const nextDigit = +decimalStr[precision];
    let result = toBigIntDecimal({
      integer: this.getIntegerStr(),
      negative: this.negative,
      decimal,
    });
    return nextDigit >= 5
      ? result[this.negative ? 'minus' : 'plus'](
          toBigIntDecimal(
            !precision
              ? {
                  integer: '1', // precision === 0, carry 1 to integer
                }
              : { decimal: '1'.padStart(decimal.length, '0') },
          ),
        )
      : result;
  }

  isEmpty() {
    return this.empty;
  }

  isNaN() {
    return this.nan;
  }

  isInfinite() {
    return this.infinite;
  }

  isInteger() {
    return !this.isInvalidate() && !this.infinite && this.decimal === 0n;
  }

  isInvalidate() {
    return this.empty || this.nan;
  }

  isZero() {
    return !this.isInvalidate() && !this.infinite && this.integer === 0n && this.decimal === 0n;
  }

  equals(target: number | string | BigIntDecimal) {
    return this === target || this.toString() === target?.toString();
  }

  lessThan(target: BigIntDecimalValue) {
    target = toBigIntDecimal(target);
    if (this.infinite) {
      if (!this.negative) return false; // this is positive infinity, must be greater than target
      return !target.infinite || !target.negative; // this is negative infinity, if target is finite, always returns true; if target is infinite, returns true only when it's positive infinity
    } else if (target.infinite) return !target.negative;
    return !!this.minus(target).negative;
  }

  greaterThan(target: BigIntDecimalValue) {
    return toBigIntDecimal(target).lessThan(this);
  }

  toNumber() {
    return this.nan ? NaN : +this.toString();
  }

  valueOf() {
    return this.toNumber();
  }

  toString() {
    if (this.isInvalidate()) return '';
    else if (this.infinite) return this.negative ? '-Infinity' : 'Infinity';
    return this.getMark() + this.getIntegerStr() + (this.decimalLen ? '.' + this.getDecimalStr() : '');
  }
}

export const toBigIntDecimal = (param: any, clone?: boolean) =>
  param instanceof BigIntDecimal && !clone ? param : new BigIntDecimal(param);
