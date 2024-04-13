import { ExtractPropTypes } from "vue";

const defaultBoolean = { type: Boolean, default: undefined };
export const editStateProps = Object.freeze({
	disabled: defaultBoolean,
	readonly: defaultBoolean,
	loading: defaultBoolean,
	mergeDisabled: defaultBoolean,
	mergeReadonly: defaultBoolean,
	mergeLoading: defaultBoolean,
});
export type EditStateProps = ExtractPropTypes<typeof editStateProps>;