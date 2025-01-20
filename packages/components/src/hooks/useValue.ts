import type { MaybeRefLikeOrGetter, UseModel } from '@lun-web/core';
import { createUseModel, objectComputed, unrefOrGet } from '@lun-web/core';
import { FormInputCollector } from '../components/form-item/collector';
import { computed, getCurrentInstance, Ref } from 'vue';
import { Status } from 'common';
import { isSet, pickNonNil, ensureArray, objectKeys } from '@lun-web/utils';
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
  getFromExtra(extra, raw) {
    const [context, vm] = extra;
    return context.getValue(vm, raw);
  },
  setByExtra(extra, value, raw) {
    const [context, vm] = extra;
    context.setValue(vm, value, raw);
  },
}) as UseModel<'value'>;

export const usePropsFromFormItem = (props: { status?: Status }) => {
  const context = FormInputCollector.child(false);
  return {
    status: computed(() => props.status || context?.status.value),
    validateProps: objectComputed(() =>
      pickNonNil(objectKeys(formItemRuleProps) as (keyof typeof formItemRuleProps)[], props, context?.validateProps),
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
    const { trueValue, falseValue } = vm.props,
      final = value ? trueValue : falseValue;
    context.setValue(vm, final, final);
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

export const useCurrentModel = createUseModel({
  defaultKey: 'current',
  defaultEvent: 'update',
}) as UseModel<'current'>;

export const createGetterForHasRawModel = (model: Ref<{ value: any; raw?: any }>) => () =>
  model.value.raw || model.value.value;

export const useValueSet = (hasRawModel: Ref<{ value: any; raw?: any }>, multiple?: MaybeRefLikeOrGetter<boolean>) =>
  computed(() => {
    const { value, raw } = hasRawModel.value;
    // raw also needs isSet, as it may be single before, and then turn on multiple, at that time raw is not null
    return unrefOrGet(multiple) ? (isSet(raw) ? raw : isSet(value) ? value : new Set(ensureArray(value))) : value;
  });

export const updateRawSetModel = (
  hasRawModel: Ref<{ value: any; raw?: any }>,
  value: any,
  multiple?: MaybeRefLikeOrGetter<boolean>,
) => {
  // pauseTracking(); // in case hasRawModel.value is tracked // pauseTracking is exported by @vue/reactivity, but not exported by Vue...
  if (unrefOrGet(multiple)) {
    const isNil = value == null,
      set = isNil || isSet(value);
    hasRawModel.value[set ? 'raw' : 'value'] = set ? (isNil ? new Set() : value) : ensureArray(value);
  } else hasRawModel.value.value = value;
  // enableTracking();
};
