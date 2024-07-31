import { ComponentInternalInstance } from 'vue';
import { createSyncHook, createAsyncHook } from '../createHooks';
import { ProcessedFormParams, UseFormOptions } from './useForm';
import { FormMethods } from './useForm.methods';

type UpdateValueParam = {
  data: any;
  rawData: any;
  path: string | string[];
  value: any;
  isDelete?: boolean
};
export const getHooks = () => ({
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
});

export type FormHooks = ReturnType<typeof getHooks>;
export type FormHooksOptions = {
  [k in keyof FormHooks]?: Parameters<FormHooks[k]['use']>[0];
};

export function createFormHooks(options: UseFormOptions) {
  const hooks = getHooks();
  if (options.hooks) {
    Object.entries(options.hooks).forEach(([key, handler]) => {
      const hook = hooks[key as keyof FormHooks];
      if (hook) hooks[key as keyof FormHooks].use(handler as any);
    });
  }
  return hooks;
}
