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
  nameToItemMap: Map<string | string[], ComponentInternalInstance>;
  itemToFormMap: WeakMap<ComponentInternalInstance, ComponentInternalInstance>;
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
  const forms = new Set<ComponentInternalInstance>();
  const itemToFormMap = new WeakMap<ComponentInternalInstance, ComponentInternalInstance>();
  const nameToItemMap = reactive(new Map<string | string[], ComponentInternalInstance>()) as Map<
    string | string[],
    ComponentInternalInstance
  >;
  const param = {
    options,
    formData,
    formState,
    hooks,
    getDefaultFormState,
    nameToItemMap,
    itemToFormMap,
  };
  const methods = useFormMethods(param, options);

  hooks.onFormConnected.use((form) => {
    if (form) forms.add(form);
  });
  hooks.onFormDisconnected.use((form) => {
    forms.delete(form);
  });
  hooks.onFormItemConnected.use(({ item, form }) => {
    if (!item) return;
    const { name } = item.props;
    if (name) nameToItemMap.set(name as any, item);
    itemToFormMap.set(item, form);
  });
  hooks.onFormItemDisconnected.use(({ item }) => {
    if (!item) return;
    const { name } = item.props;
    if (name) nameToItemMap.delete(name as any);
    itemToFormMap.delete(item);
  });

  const result = {
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
  if (__DEV__) Object.assign(result, { [Symbol.for('use-form')]: true });
  return result;
}

export type UseFormReturn = ReturnType<typeof useForm>;
