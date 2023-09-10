import type { ComputedRef } from 'vue';
import { inject, getCurrentInstance, computed, provide, reactive } from 'vue';

// TODO default null, forceInheritDisabled
const defaultBoolean = { type: Boolean, default: null };
export const editProps = {
	disabled: defaultBoolean,
	readonly: defaultBoolean,
	loading: defaultBoolean,
	forceInheritDisabled: defaultBoolean,
	forceInheritReadonly: defaultBoolean,
	forceInheritLoading: defaultBoolean,
};

export type EditState = {
	[k in keyof typeof editProps]?: boolean | null;
} & {
	readonly editable: boolean;
};

export const EDIT_PROVIDER_KEY = Symbol('edit-state');

export function useSetupEdit(
	adjust?: (state: EditState) => EditState | null | void,
	initialLocalState?: Pick<EditState, 'disabled' | 'readonly' | 'loading'>
) {
	const ctx = getCurrentInstance()!;
	if (!ctx) {
		throw new Error('Do not use `useEdit` outside the setup function scope');
	}
	const parentEditComputed = inject<ComputedRef<EditState> | undefined>(EDIT_PROVIDER_KEY);
	const localState = reactive({
		disabled: false,
		readonly: false,
		loading: false,
		...initialLocalState,
	});
	const currentEditComputed = computed(() => {
		let finalState: EditState;
		let { disabled, readonly, loading, forceInheritDisabled, forceInheritLoading, forceInheritReadonly } =
			ctx.props as EditState;
		forceInheritDisabled ||= parentEditComputed?.value.forceInheritDisabled;
		forceInheritLoading ||= parentEditComputed?.value.forceInheritLoading;
		forceInheritReadonly ||= parentEditComputed?.value.forceInheritReadonly;
		finalState = {
			disabled:
				localState.disabled ||
				disabled ||
				((forceInheritDisabled || disabled == null) && parentEditComputed?.value.disabled),
			readonly:
				localState.readonly ||
				readonly ||
				((forceInheritReadonly || readonly == null) && parentEditComputed?.value.readonly),
			loading:
				localState.loading ||
				loading ||
				((forceInheritLoading || loading == null) && parentEditComputed?.value.loading),
			forceInheritDisabled,
			forceInheritLoading,
			forceInheritReadonly,
			get editable() {
				return !this.disabled && !this.readonly && !this.loading;
			},
		};
		if (adjust instanceof Function) finalState = adjust(finalState) || finalState;
		return finalState;
	});

	provide(EDIT_PROVIDER_KEY, currentEditComputed);

	return [localState, currentEditComputed] as const;
}
