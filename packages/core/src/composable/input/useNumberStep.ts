import { ComputedRef } from 'vue';
import { TransformedUseInputOption, UseInputOptions } from '.';

export function useNumberStep(options: ComputedRef<TransformedUseInputOption<UseInputOptions<'number', number>>>) {
	const getInitStep = (isNext: boolean) => {
		let { step, min, max } = options.value;
    if (!step) return isNext ? 1 : -1;
    let result = isNext ? step : -step;
    if (result < min && Number.isFinite(min)) return isNext ? (step + min > max ? min : step + min) : min;
    else if (result > max && Number.isFinite(max)) return step * Math.floor(max / step);
    else return result;
	};
	const nextStep = (value: number) => {
		if (Number.isNaN(value)) return getInitStep(true);
	};
	const lastStep = (value: number) => {
		if (Number.isNaN(value)) return getInitStep(false);
  };
  return { nextStep, lastStep };
}
