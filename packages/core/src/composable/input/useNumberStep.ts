import { ComputedRef } from 'vue';
import { TransformedUseInputOption, UseInputOptions } from '.';
import { presets } from '../../presets';
import { unrefOrGet } from '../../utils/ref';
import { BigIntDecimal, isArrowDownEvent, isArrowUpEvent, isTruthyOrZero, prevent } from '@lun/utils';

export function processNumOptions(options: UseInputOptions) {
  const {
    toNumber,
    toNumberOrNull,
    toPrecision,
    ensureNumber,
    getPositiveInfinity,
    getNegativeInfinity,
    plus,
    minus,
    mod,
    greaterThan,
    abs,
    lessThan: mathLessThan,
    greaterThanOrEqual,
    lessThanOrEqual,
    getZero,
    equals,
    isInteger,
  } = presets.math;
  let { strict, noExponent, replaceChPeriodMark } = options;
  const adjustPrecision = <T extends number | null | BigIntDecimal>(value: T) =>
    precision === null || !value ? value : toPrecision(value, precision);
  /**
   * make value divide by step exactly by plus or minus a num. if greater == null, will return the closer one to the value
   */
  const makeDivisibleByStep = <T extends number | null | BigIntDecimal>(value: T, greater?: boolean) => {
    if (!value || step === null) return value;
    const remainder = mod(value, step);
    const plusNum = minus(step, remainder);
    const more = plus(value, plusNum),
      less = minus(value, remainder);
    if (greater) return more;
    else if (greater == null) return greaterThan(abs(plusNum), abs(remainder)) ? less : more;
    else return less;
  };
  const clampToRange = (value: any) => {
    if (!isTruthyOrZero(value)) return value;
    if (greaterThanOrEqual(value, lessThan)) value = minus(lessThan, step || 0);
    else if (lessThanOrEqual(value, moreThan)) value = plus(moreThan, step || 0);
    else if (greaterThan(value, max)) value = max;
    else if (mathLessThan(value, min)) value = min;
    return value;
  };

  const processNum = <T extends number | null | BigIntDecimal>(value: T, greater?: boolean) =>
    makeDivisibleByStep(adjustPrecision(value), greater)!;

  const precision = toNumberOrNull(options.precision);
  let step = toNumberOrNull(options.step);
  const nInfinity = getNegativeInfinity(),
    pInfinity = getPositiveInfinity();
  let min = ensureNumber(options.min, nInfinity);
  let max = ensureNumber(options.max, pInfinity);
  let moreThan = ensureNumber(options.moreThan, nInfinity);
  let lessThan = ensureNumber(options.lessThan, pInfinity);
  if (strict) {
    step = adjustPrecision(step);
    min = processNum(min, true);
    moreThan = processNum(moreThan, true);
    max = processNum(max, false);
    lessThan = processNum(lessThan, false);
  }

  const zero = getZero();
  const noPositive = lessThanOrEqual(max, zero) || lessThanOrEqual(lessThan, zero);
  const noNegative = greaterThanOrEqual(min, zero) || greaterThanOrEqual(moreThan, zero);
  const noDecimal = (precision !== null && equals(precision, zero)) || (strict && isInteger(step));
  const noNegativeSymbol = noNegative && (noExponent || noDecimal); // negative symbol is also allowed even if min >= 0, for example 1e-2(but require noDecimal === false)
  const noPositiveSymbol = noPositive && noExponent; // positive symbol is also allowed even if max <= 0, for example -1e+2
  const allowedChars = `${replaceChPeriodMark ? '。' : ''}${noExponent ? '' : 'eE'}${noNegativeSymbol ? '' : '\\-'}${
    noPositiveSymbol ? '' : '+'
  }${noDecimal ? '' : '.'}`;
  return {
    ...options,
    min,
    max,
    step,
    precision,
    moreThan,
    lessThan,
    adjustPrecision,
    makeDivisibleByStep,
    clampToRange,
    /** if strict is on, will perform adjustPrecision, makeDivisibleByStep and clampToRange; or just adjustPrecision  */
    processNum: (value: string | number | null | BigIntDecimal) =>
      strict ? clampToRange(processNum(toNumber(value))) : adjustPrecision(toNumber(value)),
    noPositive,
    noNegative,
    noDecimal,
    notAllowedNumReg: new RegExp(`[^\\s0-9${allowedChars}]`),
  };
}

export function useNumberStep(options: ComputedRef<TransformedUseInputOption<UseInputOptions>>) {
  const performStep = (isNext: boolean) => {
    const { plus, isNaN, getZero, negate, toNumber, toRawNum } = presets.math;
    let { step, value: v, onChange, type, multiple, clampToRange, strict } = options.value;
    const isN = type === 'number',
      isNS = type === 'number-text';
    if ((!isN && !isNS) || multiple) return;
    let value = toNumber(unrefOrGet(v));
    const valueIsOutOfRange = clampToRange(value) !== value;
    const valueIsNan = isNaN(value);
    if (valueIsNan) value = getZero();
    if (step === null) step = toNumber(1);
    let result = plus(value, isNext ? step : negate(step));
    const clamped = clampToRange(result);
    // clamped === result means result is valid. if it's out of range, also return the clamped value when strict is on or original value is out of range or NaN
    result = clamped === result || strict || valueIsNan || valueIsOutOfRange ? clamped : value;
    if (result !== value) onChange(isN ? toRawNum(result) : result.toString());
  };

  const methods = {
    stepUp() {
      return performStep(true);
    },
    stepDown() {
      return performStep(false);
    },
  };

  const numberHandlers = {
    onKeydown(e: KeyboardEvent) {
      if (options.value.disabled) return;
      if (isArrowDownEvent(e)) {
        prevent(e); // prevent native type=number
        methods.stepDown();
      } else if (isArrowUpEvent(e)) {
        prevent(e);
        methods.stepUp();
      }
    },
  };

  const createStepHandlers = (isNext: boolean) => {
    let firstTimer: ReturnType<typeof setTimeout>, timer: ReturnType<typeof setInterval>;
    const clear = () => {
      clearTimeout(firstTimer);
      clearInterval(timer);
    };
    return {
      onPointerdown() {
        if (options.value.disabled) return;
        const method = isNext ? methods.stepUp : methods.stepDown;
        method();
        firstTimer = setTimeout(() => {
          method();
          timer = setInterval(method, 100);
        }, 500); // TODO options for this
      },
      onPointerup: clear,
      onPointercancel: clear,
      onPointerleave: clear,
    };
  };

  return {
    numberHandlers,
    numberMethods: methods,
    stepUpHandlers: createStepHandlers(true),
    stepDownHandlers: createStepHandlers(false),
  };
}
