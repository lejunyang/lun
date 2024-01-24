import type { UseModel } from '@lun/core';
import { createUseModel } from '@lun/core';
import { useShadowDom } from './shadowDom';
import { FormInputCollector } from '../components/form-item';
import { computed, getCurrentInstance } from 'vue';
import { Status } from 'common';
import { pickNonNil } from '@lun/utils';
import { formItemRuleProps } from '../components/form-item/type';

const extra = () => {
  const vm = getCurrentInstance();
  const context = FormInputCollector.child();
  if (!context || !vm) return;
  return [context, vm] as const;
};

export const useValueModel = createUseModel({
  defaultKey: 'value',
  defaultEvent: 'update',
  extra,
  getFromExtra(extra) {
    const [context, vm] = extra;
    return context.getValue(vm);
  },
  setByExtra(extra, value) {
    const [context, vm] = extra;
    context.setValue(vm, value);
  },
}) as UseModel<'value'>;

export const useStatus = (props: { status?: Status }) => {
  const context = FormInputCollector.child(false);
  return [computed(() => props.status || context?.status.value), context] as const;
};

export const usePropsFromFormItem = (props: { status?: Status }) => {
  const context = FormInputCollector.child(false);
  return {
    status: computed(() => props.status || context?.status.value),
    validateProps: computed(() =>
      pickNonNil(
        Object.keys(formItemRuleProps) as (keyof typeof formItemRuleProps)[],
        props,
        context?.validateProps.value,
      ),
    ),
    context,
  };
};

/** used for switch, checkbox, which have 'checked', 'trueValue' and 'falseValue' props. */
export const useCheckedModel = createUseModel({
  defaultKey: 'checked',
  defaultEvent: 'update',
  extra,
  getFromExtra(extra) {
    const [context, vm] = extra;
    const value = context.getValue(vm);
    const { trueValue, falseValue } = vm.props;
    if (trueValue !== undefined) return value === trueValue;
    if (falseValue !== undefined) return value !== falseValue;
  },
  setByExtra(extra, value) {
    const [context, vm] = extra;
    const { trueValue, falseValue } = vm.props;
    context.setValue(vm, value ? trueValue : falseValue);
  },
  handleDefaultEmit(emit, vm) {
    return (name: string, ...args: any[]) => {
      const { trueValue, falseValue } = vm.props;
      if (name === 'update') {
        const checked = args[0];
        emit('update', {
          value: checked ? trueValue : falseValue,
          checked,
        });
      } else emit(name, ...args);
    };
  },
}) as UseModel<'checked'>;

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
