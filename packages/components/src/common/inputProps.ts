import { InputPeriod, InputType } from '@lun/core';
import { PropType } from 'vue';

export const inputProps = Object.freeze({
	value: { type: String },
	placeholder: { type: String },
	required: { type: String },
	type: { type: String as PropType<InputType> },
	changeWhen: { type: String as PropType<InputPeriod>, default: 'notComposing' },
	wait: { type: Number },
	waitType: { type: String as PropType<'throttle' | 'debounce'>, default: 'debounce' },
	trim: { type: Boolean, default: true },
	maxLength: { type: Number },
	restrict: { type: [String, RegExp] },
	restrictWhen: { type: String as PropType<InputPeriod>, default: 'notComposing' },
	toNullWhenEmpty: { type: Boolean, default: true },
	transform: { type: Function as PropType<(value: string | null) => any> },
	transformWhen: { type: String as PropType<InputPeriod>, default: 'notComposing' },
	emitEnterDownWhenComposing: { type: Boolean },
});

export const inputNumberProps = Object.freeze({
	...inputProps,
	min: { type: Number },
	max: { type: Number },
	precision: { type: Number },
	step: { type: Number },
	strictStep: { type: Boolean },
	noExponent: { type: Boolean },
	optimizeChPeriodSymbolForNum: { type: Boolean, default: true }
})