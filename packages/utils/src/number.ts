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
