import { ComputedRef } from 'vue';
import { TransformedUseInputOption, UseInputOptions } from '.';
import { presets } from '../../presets';
import { MaybeRefLikeOrGetter, unrefOrGet } from '../../utils/ref';

export function processNumOptions<
  T extends { [k in 'min' | 'max' | 'step' | 'precision']?: string | number | null | undefined } & {
    disabled?: MaybeRefLikeOrGetter<boolean>;
  },
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

export function useNumberStep(options: ComputedRef<TransformedUseInputOption<UseInputOptions>>) {
  const performStep = (isNext: boolean) => {
    const { plus, minus, mod, lessThan, greaterThan, isNaN, getZero, toNegative, toNumber } = presets.math;
    let { step, min, max, value, onChange, type } = options.value; // TODO lessThan, greaterThan
    if (type !== 'number' && type !== 'number-string') return;
    value = toNumber(unrefOrGet(value));
    if (isNaN(value)) value = getZero();
    if (step === null) step = 1;
    let result = value + (isNext ? step : -step);
    result = plus(value, isNext ? step : toNegative(step));
    if (lessThan(result, min)) {
      const minAddStep = plus(min, step);
      result = isNext ? (greaterThan(minAddStep, max) ? min : minAddStep) : min;
    } else if (greaterThan(result, max)) {
      result = minus(max, mod(max, step)); // result = max - (max % step)
      result = isNext || !lessThan(result, min) ? result : min;
    }
    onChange(result);
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
