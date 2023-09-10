import type { PropType, ExtractPropTypes } from "vue";

export type InputAction = 'blur' | 'input' | 'notComposing';
export const inputProps = Object.freeze({
	changeWhen: { type: String as PropType<InputAction>, default: 'input' },
	wait: { type: Number },
  waitType: { type: String as PropType<'throttle' | 'debounce'>, default: 'debounce' },
  trim: { type: Boolean, default: true },
	maxLength: { type: Number },
	restrict: { type: [String, RegExp] },
	restrictWhen: { type: String as PropType<InputAction>, default: 'input' },
	toNullWhenEmpty: { type: Boolean, default: true },
	transform: { type: Function as PropType<(value: string | null) => any> },
	transformWhen: { type: String as PropType<InputAction>, default: 'input' },
});
export type Options = ExtractPropTypes<typeof inputProps>;

export function useInput(props: Options) {
  
}