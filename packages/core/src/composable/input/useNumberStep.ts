import { ComputedRef } from 'vue';
import { TransformedUseInputOption, UseInputOptions } from '.';
import { presets } from '../../presets';
import { MaybeRefLikeOrGetter, unrefOrGet } from '../../utils/ref';
import { BigIntDecimal } from '@lun/utils';

export function processNumOptions<
  T extends {
    [k in 'min' | 'max' | 'step' | 'precision' | 'moreThan' | 'lessThan']?: string | number | null | undefined;
  } & {
    disabled?: MaybeRefLikeOrGetter<boolean>;
    strict?: boolean;
  },
>(options: T) {
  const {
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
  } = presets.math;
  const { strict } = options;
  const adjustPrecision = <T extends number | null | BigIntDecimal>(value: T) =>
    precision === null || value == null ? value : toPrecision(value, precision);
  /**
   * make value divide by step exactly by plus or minus a num. if greater == null, will return the closer one to the value
   */
  const makeDivisibleByStep = <T extends number | null | BigIntDecimal>(value: T, greater?: boolean) => {
    if (!value || step == null) return value;
    const remainder = mod(value, step);
    const plusNum = minus(step, remainder);
    const more = plus(value, plusNum),
      less = minus(value, remainder);
    if (greater) return more;
    else if (greater == null) return greaterThan(abs(plusNum), abs(remainder)) ? less : more;
    else return less;
  };
    
  const process = <T extends number | null | BigIntDecimal>(value: T, greater?: boolean) =>
    makeDivisibleByStep(adjustPrecision(toNumberOrNull(value)), greater)!;

  const precision = toNumberOrNull(options.precision);
  let step = toNumberOrNull(options.step);
  let min = ensureNumber(options.min, getNegativeInfinity());
  let max = ensureNumber(options.max, getPositiveInfinity());
  let moreThan = toNumberOrNull(options.moreThan);
  let lessThan = toNumberOrNull(options.lessThan);
  if (strict) {
    step = adjustPrecision(step);
    min = process(min, true);
    moreThan = process(moreThan, true);
    max = process(max, false);
    lessThan = process(lessThan, false);
  }
  return { ...options, min, max, step, precision, moreThan, lessThan, adjustPrecision, makeDivisibleByStep };
}

export function useNumberStep(options: ComputedRef<TransformedUseInputOption<UseInputOptions>>) {
  const performStep = (isNext: boolean) => {
    const { plus, minus, mod, lessThan, greaterThan, isNaN, getZero, negate, toNumber, toRawNum } = presets.math;
    let { step, min, max, value: v, onChange, type, multiple } = options.value; // TODO lessThan, greaterThan
    const isN = type === 'number',
      isNS = type === 'number-string';
    if ((!isN && !isNS) || multiple) return;
    let value = toNumber(unrefOrGet(v));
    if (isNaN(value)) value = getZero();
    if (step === null) step = toNumber(1);
    let result = plus(value, isNext ? step : negate(step));
    if (lessThan(result, min)) {
      const minAddStep = plus(min, step);
      result = isNext ? (greaterThan(minAddStep, max) ? min : minAddStep) : min;
    } else if (greaterThan(result, max)) {
      result = minus(max, mod(max, step)); // result = max - (max % step)
      result = isNext || !lessThan(result, min) ? result : min;
    }
    onChange(isN ? toRawNum(result) : result.toString());
  };

  const methods = {
    nextStep() {
      return performStep(true);
    },
    prevStep() {
      return performStep(false);
    },
  };

  const numberHandlers = {
    onKeydown(e: KeyboardEvent) {
      if (options.value.disabled) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault(); // prevent native type=number
        methods.prevStep();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        methods.nextStep();
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
        const method = isNext ? methods.nextStep : methods.prevStep;
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
    nextStepHandlers: createStepHandlers(true),
    prevStepHandlers: createStepHandlers(false),
  };
}
