import {
  objectSet,
  objectGet,
  deepCopy,
  isArray,
  toArrayIfTruthy,
  stringToPath,
  isObject,
  isString,
  pick,
} from '@lun/utils';
import { MaybeFormItemStatusMessages, MaybeFormItemPath, ProcessedFormParams, UseFormOptions } from './useForm';

export function useFormMethods(params: ProcessedFormParams, options: UseFormOptions) {
  const { data, rawData, formState, hooks, getDefaultFormState, nameToItemMap, itemToFormMap } = params;
  const methods = {
    isPlainName(name?: string) {
      if (!name) return false;
      const formItem = nameToItemMap.get(name);
      const parent = itemToFormMap.get(formItem!);
      return !!(formItem?.props.plainName ?? parent?.props.plainName);
    },
    getValue(path: MaybeFormItemPath, raw?: boolean) {
      if (!path) return;
      const source = raw ? rawData.value : data.value;
      if (isArray(path) || !methods.isPlainName(path)) return objectGet(source, path);
      else return source[path];
    },
    setValue(path: MaybeFormItemPath, value: any, rawValue?: any) {
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
    deletePath(path: MaybeFormItemPath) {
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
      await hooks.onValidate.exec({ ...params, ...pick(methods, ['setStatusMessages']) });
      return params.formState.value.statusMessages;
    },
    clearStatusMessages() {
      formState.value.statusMessages = {};
    },
    setStatusMessages(path: MaybeFormItemPath, statusMsg: MaybeFormItemStatusMessages) {
      if (!path || !statusMsg) return;
      const finalStatusMsgs = {} as Record<string, string[]>;
      toArrayIfTruthy(statusMsg).forEach((m) => {
        if (!m) return;
        let msg: string;
        const status = isString(m) ? ((msg = m), 'error') : ((msg = m.message), m.status || 'error');
        if (msg) (finalStatusMsgs[status] ||= []).push(msg);
      });
      if (isArray(path)) objectSet(formState.value.statusMessages, path, finalStatusMsgs);
      else formState.value.statusMessages[path] = finalStatusMsgs;
    },
    getStatusMessages<Status>(
      path: MaybeFormItemPath,
      status?: Status,
    ): Status extends string ? string[] : Record<string, string[]> {
      // @ts-ignore
      if (!path) return status ? [] : {};
      const target = isArray(path)
        ? objectGet(formState.value.statusMessages, path)
        : formState.value.statusMessages[path];
      return status ? target?.[status] || [] : target || {};
    },
  };
  return methods;
}

export type FormMethods = ReturnType<typeof useFormMethods>;
