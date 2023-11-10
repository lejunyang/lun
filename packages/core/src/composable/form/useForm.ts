import { Ref, getCurrentInstance, reactive, ref, UnwrapNestedRefs } from 'vue';
import { useFormMethods } from './useForm.methods';
import { FormHooks, FormHooksOptions, createFormHooks } from './useForm.hooks';
import { deepCopy, isObject } from '@lun/utils';
import { LocalEditState, useSetupEdit } from '../../hooks/useSetupEdit';

export type FormState = {
  errors: Record<string, any>;
  isDirty: boolean;
  dirtyFields: Set<string>;
} & LocalEditState;

export type UseFormOptions<Data extends object = Record<string, any>> = {
  defaultFormData?: Partial<Data>;
  defaultFormState?: Partial<FormState>;
  hooks?: FormHooksOptions;
};

export type UseFormReturnOptions<Data extends object = Record<string, any>> = UnwrapNestedRefs<UseFormOptions<Data>>;

export type ProcessedFormParams<Data extends object = Record<string, any>> = {
  formData: Ref<Data>;
  formState: Ref<FormState>;
  hooks: FormHooks;
  getDefaultFormState(): FormState;
};

export function useForm<Data extends object = Record<string, any>>(_options: UseFormOptions<Data>) {
  const options = reactive(_options) as UseFormOptions;
  const formData = ref(deepCopy(options.defaultFormData || {})) as Ref<Data>;
  const getDefaultFormState = () =>
    deepCopy({ errors: {}, isDirty: false, dirtyFields: new Set<string>(), ...options.defaultFormState });
  const formState = ref(getDefaultFormState());
  const hooks = createFormHooks(options);
  const param = { formData, formState, hooks, getDefaultFormState };
  const methods = useFormMethods(param, options);
  const forms = [];

  const setup = () => {
    const vm = getCurrentInstance();
    if (!vm) return;
    const editState = useSetupEdit({
      adjust(state) {
        (['disabled', 'readonly', 'loading'] as const).forEach((key) => {
          if (formState.value[key] !== undefined) state[key] = formState.value[key];
        });
      },
    });
    return editState;
  };

  return {
    options: options as UseFormReturnOptions<Data>,
    get formData() {
      return formData.value;
    },
    set formData(value) {
      if (__DEV__ && !isObject(value)) throw new Error('formData must be an object');
      formData.value = value;
    },
    get formState() {
      return formState.value;
    },
    set formState(value) {
      if (__DEV__ && !isObject(value)) throw new Error('formState must be an object');
      formState.value = value;
    },
    /**
     * @private will be called when Form setup, do not call it manually
     */
    setup,
    ...methods,
    hooks,
  };
}
