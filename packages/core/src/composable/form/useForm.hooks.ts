import { createSyncHook, createAsyncHook } from '../createHooks';
import { ProcessedFormParams, UseFormOptions } from './useForm';
import { FormMethods } from './useForm.methods';

type UpdateValueParam = {
  formData: any;
  path: string | string[];
  value: any;
};
export const getHooks = () => ({
  // value updated
  onUpdateValue: createSyncHook<(param: UpdateValueParam) => UpdateValueParam | undefined>(),
  onFormReset: createSyncHook<() => void>(),
  // validate
  onValidate:
    createAsyncHook<
      (param: Omit<ProcessedFormParams, 'hooks'> & Pick<FormMethods, 'appendError' | 'setError'>) => void
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
