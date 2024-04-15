import { freeze } from "@lun/utils";
import { ExtractPropTypes } from "vue";
import { undefBoolProp } from "./propConstructor";

export const editStateProps = freeze({
	disabled: undefBoolProp,
	readonly: undefBoolProp,
	loading: undefBoolProp,
	mergeDisabled: undefBoolProp,
	mergeReadonly: undefBoolProp,
	mergeLoading: undefBoolProp,
});
export type EditStateProps = ExtractPropTypes<typeof editStateProps>;