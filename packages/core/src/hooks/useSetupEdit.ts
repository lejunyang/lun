import type { ComponentInternalInstance } from 'vue';
import { inject, getCurrentInstance, provide, reactive } from 'vue';
import { runIfFn } from '@lun-web/utils';
import { objectComputed } from '../utils';

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
}): [
  Readonly<EditState>,
  {
    disabled: boolean;
    readonly: boolean;
    loading: boolean;
  },
] {
  const { adjust, initialLocalState, noInherit } = options || {};
  const ctx = getCurrentInstance()!;
  if (!ctx) {
    if (__DEV__) throw new Error('Do not use `useSetupEdit` outside the setup function scope');
  }
  // @ts-ignore
  if (ctx[EDIT_PROVIDER_KEY]) return ctx[EDIT_PROVIDER_KEY];

  const parentEditComputed = noInherit ? undefined : inject<EditState | undefined>(EDIT_PROVIDER_KEY);
  const localState = reactive({ disabled: false, readonly: false, loading: false, ...initialLocalState });
  const currentEditComputed = objectComputed(() => {
    let finalState: EditState;
    let { disabled, readonly, loading, mergeDisabled, mergeLoading, mergeReadonly } = ctx.props as EditState;
    mergeDisabled ??= parentEditComputed?.mergeDisabled;
    mergeLoading ??= parentEditComputed?.mergeLoading;
    mergeReadonly ??= parentEditComputed?.mergeReadonly;
    finalState = {
      disabled:
        localState.disabled || disabled || ((mergeDisabled || disabled == null) && parentEditComputed?.disabled),
      readonly:
        localState.readonly || readonly || ((mergeReadonly || readonly == null) && parentEditComputed?.readonly),
      loading: localState.loading || loading || ((mergeLoading || loading == null) && parentEditComputed?.loading),
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
  (ctx as any)[EDIT_PROVIDER_KEY] = currentEditComputed;

  return [currentEditComputed, localState] as const;
}

export function useEdit() {
  const vm = getCurrentInstance() as
    | (ComponentInternalInstance & { [EDIT_PROVIDER_KEY]?: Readonly<EditState> })
    | undefined;
  return vm?.[EDIT_PROVIDER_KEY];
}
