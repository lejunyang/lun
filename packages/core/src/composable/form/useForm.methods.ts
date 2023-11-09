import { objectSet, objectGet, deepCopy, isArray, toArrayIfNotNil } from '@lun/utils';
import { ProcessedFormParams, UseFormOptions } from './useForm';

export function useFormMethods(
  { formData, formState, hooks, getDefaultFormState }: ProcessedFormParams,
  options: UseFormOptions
) {
  const methods = {
    getValue(path: string | string[]) {
      if (isArray(path)) return objectGet(formData.value, path);
      else return formData.value[path];
    },
    setValue(path: string | string[], value: any) {
      if (isArray(path)) objectSet(formData.value, path, value);
      else formData.value[path] = value;
      hooks.onUpdateValue.exec({ formData: formData.value, path, value });
    },
    resetFormData() {
      formData.value = deepCopy(options.defaultFormData || {});
      hooks.onFormReset.exec(undefined);
    },
    resetFormState() {
      formState.value = getDefaultFormState();
    },
    clearErrors() {
      formState.value.errors = {};
    },
    setError(path: string | string[], error: string | string[] | null) {
      if (isArray(path)) objectSet(formState.value.errors, path, error);
      else formState.value.errors[path] = error;
    },
    getError(path: string | string[]) {
      if (isArray(path)) return objectGet(formState.value.errors, path);
      else return formState.value.errors[path];
    },
    appendError(path: string | string[], error: string | string[]) {
      if (!error || !error.length) return;
      const errors = methods.getError(path) as string | string[];
      methods.setError(path, toArrayIfNotNil(errors).concat(toArrayIfNotNil(error)));
    },
  };
  return methods;
}

export type FormMethods = ReturnType<typeof useFormMethods>;
