---
title: useForm
lang: zh-CN
---

`useForm`用于生成表单实例，管理表单数据和表单状态，并提供一系列方法和钩子函数，帮助开发者更方便地处理表单相关的逻辑。

## 参数

```ts
export type UseFormOptions<Data extends CommonObject = CommonObject> = {
  config?: Record<string, any>; // 暂未使用
  defaultData?: Partial<Data>;
  defaultFormState?: Partial<FormState>;
  hooks?: FormHooksOptions;
};
```

## 钩子函数

有待以后完善文档

```ts
const hooks = {
  // form lifecycle
  onFormConnected: createSyncHook<(formInstance: ComponentInternalInstance) => void>(),
  onFormDisconnected: createSyncHook<(formInstance: ComponentInternalInstance) => void>(),
  // form-item lifecycle
  onFormItemConnected:
    createSyncHook<(vms: { item: ComponentInternalInstance; form: ComponentInternalInstance }) => void>(),
  onFormItemDisconnected:
    createSyncHook<(vms: { item: ComponentInternalInstance; form: ComponentInternalInstance }) => void>(),
  // value updated
  /** trigger when value of one field updates */
  onUpdateValue: createSyncHook<(param: UpdateValueParam) => UpdateValueParam | undefined>(),
  onFormReset: createSyncHook<() => void>(),
  // validate
  onValidate:
    createAsyncHook<
      (param: Omit<ProcessedFormParams, 'hooks'> & Pick<FormMethods, 'setStatusMessages'>) => void
    >(),
}
```

使用示例：

```ts
const form = useForm({
  hooks: {
    // add hooks on created
    onFormConnected(formInstance) {
      console.log('form connected', formInstance.props)
    }
  }
})
// or
const onUpdateValue = ({ value, path }) => {
  console.log('value updated', value, path)
}
form.hooks.onValidate.use(onUpdateValue)
// remove listener
form.hooks.onValidate.eject(onUpdateValue)
// use once
form.hooks.onValidate.use(onUpdateValue, { once: true });
```

## 返回值

```ts
export type MaybeFormItemPath = string | string[] | null | undefined;
export type FormMethods = {
  isPlainName(name?: string): boolean;
  getValue(path: MaybeFormItemPath, raw?: boolean): any;
  setValue(path: MaybeFormItemPath, value: any, rawValue?: any): void;
  deletePath(path: MaybeFormItemPath): void;
  resetFormData(): void;
  resetFormState(): void;
  validate(): Promise<Record<string, Record<string, string[]>>>;
  clearStatusMessages(): void;
  setStatusMessages(path: MaybeFormItemPath, statusMsg: MaybeFormItemStatusMessages): void;
  getStatusMessages<Status>(
    path: MaybeFormItemPath,
    status?: Status,
  ): Status extends string ? string[] : Record<string, string[]>;
};
export type FormState = {
  /**
   * { field1: { error: ['msg'], warning: ['msg'] } }
   */
  statusMessages: Record<string, Record<string, string[]>>;
  isDirty: boolean; // 暂未实现
  dirtyFields: Set<string>; // 暂未实现
} & LocalEditState;

// 返回的data、rawData、formState均为响应式，可直接修改
export type UseFormReturn = {
  data: Data;
  rawData: unknown;
  formState: FormState;
  hooks: FormHooks;
} & FormMethods;
```