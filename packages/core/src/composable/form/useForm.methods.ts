import { objectSet, objectGet, deepCopy, isArray, toArrayIfTruthy } from '@lun/utils';
import { ProcessedFormParams, UseFormOptions } from './useForm';

export function useFormMethods(
  { formData, formState, hooks, getDefaultFormState }: ProcessedFormParams,
  options: UseFormOptions,
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
    setError(path: string | string[] | null | undefined, error: string | string[] | null) {
      if (!path) return;
      if (isArray(path)) objectSet(formState.value.errors, path, error);
      else formState.value.errors[path] = error;
    },
    getError(path: string | string[] | null | undefined): any[] {
      if (!path) return [];
      let result: any;
      if (isArray(path)) result = objectGet(formState.value.errors, path);
      else result = formState.value.errors[path];
      return toArrayIfTruthy(result);
    },
    appendError(path: string | string[], error: string | string[]) {
      if (!error || !error.length) return;
      const errors = methods.getError(path);
      methods.setError(path, errors.concat(...toArrayIfTruthy(error)));
    },
  };
  return methods;
}

export type FormMethods = ReturnType<typeof useFormMethods>;
