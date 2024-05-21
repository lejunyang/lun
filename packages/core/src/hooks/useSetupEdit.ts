import type { ComputedRef } from 'vue';
import { inject, getCurrentInstance, computed, provide, reactive } from 'vue';
import { runIfFn } from '../../../utils/src/function';

export type EditState = {
  disabled?: boolean;
  readonly?: boolean;
  loading?: boolean;
  mergeDisabled?: boolean;
  mergeReadonly?: boolean;
  mergeLoading?: boolean;
  readonly interactive: boolean;
  readonly editable: boolean;
};
export type LocalEditState = Pick<EditState, 'disabled' | 'readonly' | 'loading'>;
export const EDIT_PROVIDER_KEY = Symbol(__DEV__ ? 'l-edit-provider-key' : '');

export function useSetupEdit(options?: {
  adjust?: (state: EditState) => EditState | null | void;
  initialLocalState?: LocalEditState;
  noInherit?: boolean;
}) {
  const { adjust, initialLocalState, noInherit } = options || {};
  const ctx = getCurrentInstance()!;
  if (!ctx) {
    if (__DEV__) throw new Error('Do not use `useSetupEdit` outside the setup function scope');
  }
  const parentEditComputed = noInherit ? undefined : inject<ComputedRef<EditState> | undefined>(EDIT_PROVIDER_KEY);
  const localState = reactive({ disabled: false, readonly: false, loading: false, ...initialLocalState });
  const currentEditComputed = computed(() => {
    let finalState: EditState;
    let { disabled, readonly, loading, mergeDisabled, mergeLoading, mergeReadonly } = ctx.props as EditState;
    mergeDisabled ??= parentEditComputed?.value.mergeDisabled;
    mergeLoading ??= parentEditComputed?.value.mergeLoading;
    mergeReadonly ??= parentEditComputed?.value.mergeReadonly;
    finalState = {
      disabled:
        localState.disabled || disabled || ((mergeDisabled || disabled == null) && parentEditComputed?.value.disabled),
      readonly:
        localState.readonly || readonly || ((mergeReadonly || readonly == null) && parentEditComputed?.value.readonly),
      loading:
        localState.loading || loading || ((mergeLoading || loading == null) && parentEditComputed?.value.loading),
      mergeDisabled,
      mergeLoading,
      mergeReadonly,
      get interactive() {
        return !this.disabled && !this.loading;
      },
      get editable() {
        return this.interactive && !this.readonly;
      },
    };
    finalState = runIfFn(adjust, finalState) || finalState;
    return finalState;
  });

  provide(EDIT_PROVIDER_KEY, currentEditComputed);

  return [currentEditComputed, localState] as const;
}
