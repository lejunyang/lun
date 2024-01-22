import { ComputedRef } from 'vue';
import { TransformedUseInputOption, UseInputOptions } from '.';
import { presets } from '../../presets';

export function processNumOptions<
  T extends { [k in 'min' | 'max' | 'step' | 'precision']?: string | number | null | undefined },
>(options: T) {
  const { toNumberOrNull, toPrecision, ensureNumber, getPositiveInfinity, getNegativeInfinity } = presets.math;
  const precision = toNumberOrNull(options.precision);
  const toFixed = (value?: string | number | null) => {
    value = toNumberOrNull(value);
    return precision === null || value === null ? value : toPrecision(value, precision);
  };
  const step = toFixed(options.step);
  const min = ensureNumber(options.min, getNegativeInfinity());
  const max = ensureNumber(options.max, getPositiveInfinity());
  return { ...options, min, max, step, precision };
}

export function useNumberStep(options: ComputedRef<TransformedUseInputOption<UseInputOptions<'number', number>>>) {
  const getValue = (isNext: boolean) => {
    const { plus, multiply, divide, lessThan, greaterThan, isNaN, getZero, toNegative, floor, toNumber } = presets.math;
    let { step, min, max, value, onChange } = options.value;
    value = toNumber(value);
    if (isNaN(value)) value = getZero();
    if (step === null) step = 1;
    let result = value + (isNext ? step : -step);
    result = plus(value, isNext ? step : toNegative(step));
    if (lessThan(result, min)) {
      const minAddStep = plus(min, step);
      result = isNext ? (greaterThan(minAddStep, max) ? min : minAddStep) : min;
    } else if (greaterThan(result, max)) {
      result = multiply(step, floor(divide(max, step))); // result = result - (result % step)
      result = isNext || !lessThan(result, min) ? result : min;
    }
    onChange(result);
  };

  const methods = {
    nextStep() {
      return getValue(true);
    },
    prevStep() {
      return getValue(false);
    },
  };

  const handlers = {
    onKeydown(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') methods.nextStep();
      if (e.key === 'ArrowUp') methods.prevStep();
    },
  };

  return {
    handlers,
    methods,
  };
}
