import type { ComputedRef } from 'vue';
import { inject, getCurrentInstance, computed, provide, reactive } from 'vue';

export type EditState = {
  disabled?: boolean;
  readonly?: boolean;
  loading?: boolean;
  forceInheritDisabled?: boolean;
  forceInheritReadonly?: boolean;
  forceInheritLoading?: boolean;
  readonly editable: boolean;
};

export const EDIT_PROVIDER_KEY = Symbol(__DEV__ ? 'l-edit-provider-key' : '');

export function useSetupEdit(options?: {
  adjust?: (state: EditState) => EditState | null | void;
  initialLocalState?: Pick<EditState, 'disabled' | 'readonly' | 'loading'>;
  noInherit?: boolean;
}) {
  const { adjust, initialLocalState, noInherit } = options || {};
  const ctx = getCurrentInstance()!;
  if (!ctx) {
    if (__DEV__) throw new Error('Do not use `useSetupEdit` outside the setup function scope');
  }
  const parentEditComputed = noInherit ? undefined : inject<ComputedRef<EditState> | undefined>(EDIT_PROVIDER_KEY);
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

  return [currentEditComputed, localState] as const;
}
