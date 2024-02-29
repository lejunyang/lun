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
  return Number.isNaN(num) ? (defaultVal != null ? defaultVal : val) : num;
}

export function toNumberOrNull(val: any) {
  const num = +val;
  return Number.isNaN(num) ? null : num;
}

export function ensureNumber(val: any, defaultVal: number) {
  const num = +val;
  return Number.isNaN(num) ? (defaultVal != null ? defaultVal : num) : num;
}

export const numberRegex =
  /(?<sign>[-+])?(?<integer>[0-9]*)(?<decimal>[.。][0-9]*)?((e|E)(?<expSign>[-+])?(?<exp>[0-9]*))?/;

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

  constructor(
    value:
      | string
      | number
      | BigIntDecimal
      | {
          integer?: string;
          decimal?: string;
          negative?: boolean;
          exp?: string;
          expNegative?: boolean;
          infinite?: boolean;
          nan?: boolean;
        },
  ) {
    if (!new.target) {
      return new BigIntDecimal(value);
    }
    if (value instanceof BigIntDecimal) {
      return new BigIntDecimal({
        integer: value.getIntegerStr(),
        decimal: value.getDecimalStr(),
        negative: value.negative,
        infinite: value.infinite,
        nan: value.nan,
      });
    } else if (isNumber(value) || isString(value)) {
      return this.initStrOrNum(value)!;
    }
    let { integer = '', decimal = '', negative, exp, expNegative, infinite, nan } = value;
    this.negative = negative;
    if (nan || (!integer && !decimal)) {
      this.nan = true;
      return;
    }
    if (infinite) {
      this.infinite = true;
      return;
    }
    decimal = decimal.replace(/0+$/, ''); // remove trailing zeros of decimal
    let decimalLen = decimal.length;
    if (exp) {
      const e = +exp;
      if (__DEV__ && Number.isNaN(e)) throw new Error('Invalid exponent');
      if (expNegative) {
        decimal = integer.slice(-e) + decimal;
        integer = integer.slice(0, integer.length - e);
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
      return new BigIntDecimal({ integer, decimal, negative: sign === '-', exp, expNegative: expSign === '-' });
    } else this.nan = true;
  }

  getMark() {
    return this.negative ? '-' : '';
  }

  getIntegerStr() {
    return this.integer.toString();
  }

  getDecimalStr() {
    return this.decimal.toString().padStart(this.decimalLen, '0');
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
    const clone = new BigIntDecimal(this);
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
    const nextDecimalLength = calDecimalLen(maxDecimalLength);

    const valueStr = calculator(myAlignedDecimal, offsetAlignedDecimal)
      .toString()
      .padStart(nextDecimalLength + 1, '0');
    // 1.001 + (-1) => 1001 + (-1000) => 1 => 0001

    const negative = valueStr[0] === '-';
    return new BigIntDecimal({
      integer: valueStr.slice(negative ? 1 : 0, -nextDecimalLength),
      decimal: valueStr.slice(-nextDecimalLength),
      negative,
    });
  }

  /**
   * @private
   * if this or target is infinite, return infinite; if this or target is NaN, return NaN; or return undefined
   */
  private check(value: string | number | BigIntDecimal) {
    const target = new BigIntDecimal(value);
    if (this.isInvalidate() || target.isInvalidate()) return new BigIntDecimal(NaN);
    else if (this.infinite || target.infinite) return new BigIntDecimal({ infinite: true });
  }

  plus(value: string | number | BigIntDecimal): BigIntDecimal {
    const target = new BigIntDecimal(value);
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

  minus(value: string | number | BigIntDecimal): BigIntDecimal {
    return this.plus(new BigIntDecimal(value).negated());
  }

  multi(value: string | number | BigIntDecimal): BigIntDecimal {
    const target = new BigIntDecimal(value);
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

  mod(value: string | number | BigIntDecimal): BigIntDecimal {
    const target = new BigIntDecimal(value);
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
      return new BigIntDecimal(this);
    }
    // remove decimal part
    const temp = new BigIntDecimal({
      integer: this.getIntegerStr(),
      negative: this.negative,
    });
    if (this.negative) {
      // -1.1 => -2
      return temp.plus(
        new BigIntDecimal({
          integer: '1',
          negative: true,
        }),
      );
    }
    return temp;
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

  isInvalidate() {
    return this.empty || this.nan;
  }

  equals(target: string | BigIntDecimal) {
    return this.toString() === target?.toString();
  }

  lessThan(target: BigIntDecimal) {
    if (this.infinite) {
      if (!this.negative) return false; // this is positive infinity, must be greater than target
      return !target.infinite || !target.negative; // this is negative infinity, if target is finite, always returns true; if target is infinite, returns true only when it's positive infinity
    } else if (target.infinite) return !target.negative;
    return this.minus(target).negative;
  }

  greaterThan(target: BigIntDecimal) {
    return target.lessThan(this);
  }

  toNumber() {
    return this.nan ? NaN : +this.toString();
  }

  toString() {
    if (this.isInvalidate()) return '';
    else if (this.infinite) return this.negative ? '-Infinity' : 'Infinity';
    return this.getMark() + this.getIntegerStr() + (this.decimalLen ? '.' + this.getDecimalStr() : '');
  }
}
