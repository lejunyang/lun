import { Ref, reactive, ref, ComponentInternalInstance } from 'vue';
import { useFormMethods } from './useForm.methods';
import { FormHooks, FormHooksOptions, createFormHooks } from './useForm.hooks';
import { CommonObject, deepCopy, isObject } from '@lun/utils';
import { LocalEditState } from '../../hooks/useSetupEdit';

export type FormState = {
  errors: Record<string, any>;
  isDirty: boolean;
  dirtyFields: Set<string>;
} & LocalEditState;

export type UseFormOptions<Data extends CommonObject = CommonObject> = {
  config?: Record<string, any>;
  defaultFormData?: Partial<Data>;
  defaultFormState?: Partial<FormState>;
  hooks?: FormHooksOptions;
};

export type ProcessedFormParams<Data extends CommonObject = CommonObject> = {
  options: UseFormOptions<Data>;
  formData: Ref<Data>;
  formState: Ref<FormState>;
  hooks: FormHooks;
  getDefaultFormState(): FormState;
};

export function useForm<
  T extends UseFormOptions,
  Data extends CommonObject = T extends UseFormOptions<infer D> ? D : CommonObject,
>(_options?: T) {
  const options = {
    ..._options,
    config: reactive(_options?.config || {}),
  } as UseFormOptions;
  const formData = ref(deepCopy(options.defaultFormData || {})) as Ref<Data>;
  const getDefaultFormState = () =>
    deepCopy({ errors: {}, isDirty: false, dirtyFields: new Set<string>(), ...options.defaultFormState });
  const formState = ref(getDefaultFormState());
  const hooks = createFormHooks(options);
  const param = { options, formData, formState, hooks, getDefaultFormState };
  const methods = useFormMethods(param, options);
  const forms = new Set<ComponentInternalInstance>();

  hooks.onFormSetup.use((form) => {
    if (form) forms.add(form);
  });
  hooks.onFormUnmount.use((form) => {
    forms.delete(form);
  });

  return {
    config: options.config,
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
    ...methods,
    hooks,
  };
}

export type UseFormReturn = ReturnType<typeof useForm>;
