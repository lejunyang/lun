import type { UseModel } from '@lun/core';
import { createUseModel } from '@lun/core';
import { useShadowDom } from './shadowDom';
import { FormInputCollector } from '../components/form-item';
import { getCurrentInstance } from 'vue';

export const useValueModel = createUseModel({
  defaultKey: 'value',
  defaultEvent: 'update',
  extra() {
    const vm = getCurrentInstance();
    const context = FormInputCollector.child();
    if (!context) return;
    return [context, vm] as const;
  },
  getFromExtra(extra) {
    if (!extra) return;
    const [context, vm] = extra;
    return context.getValue(vm);
  },
  setByExtra(extra, value) {
    if (!extra) return;
    const [context, vm] = extra;
    context.setValue(vm, value);
  },
}) as UseModel<'value'>;

export const useOpenModel = createUseModel({
  defaultKey: 'open',
  defaultEvent: 'update',
  handleDefaultEmit(emit) {
    return (name: string, ...args: any[]) => {
      emit(name, ...args);
      if (name === 'update') {
        if (args[0]) {
          emit('open');
        } else {
          emit('close');
        }
      }
    };
  },
}) as UseModel<'open'>;

/**
 * used to make CE compatible with v-model.\
 * If we want to make v-model natively work on CE, we need to do a lot of work, such as delegate events and sync the value.
 * But we can use a tricky way to make it work, since v-model would add an `_assign` function to the element. We just need to call that manually.
 */
export function useVModelCompatible() {
  const shadowDom = useShadowDom<HTMLInputElement & { _assign?: (val: any) => void }, HTMLInputElement>();
  return [
    (val: any) => {
      if (shadowDom.CE?._assign instanceof Function) {
        shadowDom.CE._assign(val);
      }
    },
    shadowDom,
  ] as const;
}
