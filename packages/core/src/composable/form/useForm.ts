import {
  Ref,
  getCurrentInstance,
  reactive,
  ref,
  UnwrapNestedRefs,
} from 'vue';
import { useFormMethods } from './useForm.methods';
import { FormHooks, FormHooksOptions, createFormHooks } from './useForm.hooks';
import { deepCopy } from '@lun/utils';

export type FormState = {
  errors: Record<string, any>;
  isDirty: boolean;
  dirtyFields: Set<string>;
};

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

  const setup = () => {
    const vm = getCurrentInstance();
    if (!vm) return;
  };

  return {
    options: options as UseFormReturnOptions<Data>,
    get formData() {
      return formData.value;
    },
    get formState() {
      // TODO proxy editState + formState
      return formState.value;
    },
    /**
     * @private will be called when Form setup, do not call it manually
     */
    setup,
    ...methods,
    hooks,
  };
}
