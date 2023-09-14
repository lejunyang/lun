const defaultBoolean = { type: Boolean, default: null };
export const editStateProps = Object.freeze({
	disabled: defaultBoolean,
	readonly: defaultBoolean,
	loading: defaultBoolean,
	forceInheritDisabled: defaultBoolean,
	forceInheritReadonly: defaultBoolean,
	forceInheritLoading: defaultBoolean,
});