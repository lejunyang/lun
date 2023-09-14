import { InputPeriod } from '@lun/core';
import { PropType } from 'vue';

export const inputProps = Object.freeze({
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
});