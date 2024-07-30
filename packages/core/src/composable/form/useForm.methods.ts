import { objectSet, objectGet, deepCopy, isArray, toArrayIfTruthy, stringToPath, isObject } from '@lun/utils';
import { ProcessedFormParams, UseFormOptions } from './useForm';

export function useFormMethods(params: ProcessedFormParams, options: UseFormOptions) {
  const { data, rawData, formState, hooks, getDefaultFormState, nameToItemMap, itemToFormMap } = params;
  const methods = {
    isPlainName(name?: string) {
      if (!name) return false;
      const formItem = nameToItemMap.get(name);
      const parent = itemToFormMap.get(formItem!);
      return !!(formItem?.props.plainName ?? parent?.props.plainName);
    },
    getValue(path: string | string[] | null | undefined, raw?: boolean) {
      if (!path) return;
      const source = raw ? rawData.value : data.value;
      if (isArray(path) || !methods.isPlainName(path)) return objectGet(source, path);
      else return source[path];
    },
    setValue(path: string | string[] | null | undefined, value: any, rawValue?: any) {
      if (!path) return;
      if (isArray(path) || !methods.isPlainName(path)) {
        objectSet(data.value, path, value);
        objectSet(rawData.value, path, rawValue);
      } else {
        data.value[path] = value;
        rawData.value[path] = rawValue;
      }
      hooks.onUpdateValue.exec({ data: data.value, path, value, rawData: rawData.value });
    },
    deletePath(path: string | string[] | null | undefined) {
      if (!path) return;
      if (!isArray(path) && !methods.isPlainName(path)) path = stringToPath(path);
      if (isArray(path)) {
        if (!path.length) return;
        const last = path.pop();
        if (!path.length) {
          delete data.value[last!];
          delete rawData.value[last!];
        } else {
          const obj = objectGet(data.value, path);
          if (isObject(obj)) {
            delete obj[last!];
          }
          const rawObj = objectGet(rawData.value, path);
          if (isObject(rawObj)) {
            delete rawObj[last!];
          }
        }
      } else {
        delete data.value[path];
        delete rawData.value[path];
      }
      hooks.onUpdateValue.exec({
        data: data.value,
        path,
        isDelete: true,
        value: undefined,
        rawData: rawData.value,
      });
    },
    resetFormData() {
      data.value = deepCopy(options.defaultData || {});
      hooks.onFormReset.exec(undefined);
    },
    resetFormState() {
      formState.value = getDefaultFormState();
    },
    async validate() {
      await hooks.onValidate.exec({ ...params, setError: methods.setError, appendError: methods.appendError });
      return params.formState.value.errors;
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
