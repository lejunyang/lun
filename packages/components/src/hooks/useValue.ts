import type { UseModel } from '@lun/core';
import { createUseModel } from '@lun/core';
import { FormInputCollector } from '../components/form-item/collector';
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

export const useViewDate = createUseModel({
  defaultKey: 'viewDate',
  defaultEvent: 'updateViewDate',
}) as UseModel<'viewDate'>;

export const useTypeModel = createUseModel({
  defaultKey: 'type',
  defaultEvent: 'updateType',
}) as UseModel<'type'>;
