import { useSelectMethods } from '@lun/core';
import { Ref, WritableComputedRef, computed, toRef } from 'vue';
import { CommonProcessedOption, useCollectorValue } from 'hooks';
import { SelectCollector } from './collector';
import { useActivateOption } from './useActivateOption';
import { toArrayIfNotNil } from '@lun/utils';

export function useSelect(
  props: { upDownToggle?: boolean; autoActivateFirst?: boolean; multiple?: boolean },
  valueModel: WritableComputedRef<string | string[] | null | undefined> | Ref<string | string[] | null | undefined>,
  {
    isHidden,
    onSingleSelect,
  }: {
    isHidden?: (option: CommonProcessedOption) => boolean;
    onSingleSelect?: (value: string) => void;
  } = {},
) {
  const selectedValueSet = computed(() => new Set(toArrayIfNotNil(valueModel.value)));
  const [childrenInfo, valueToChild, valueToLabel] = useCollectorValue(() => context);

  const methods = useSelectMethods({
    multiple: toRef(props, 'multiple'),
    valueSet: selectedValueSet,
    onChange(value) {
      valueModel.value = value;
      if (onSingleSelect && !props.multiple) onSingleSelect(value);
    },
    allValues: () => childrenInfo.childrenValuesSet,
  });
  const context = SelectCollector.parent({
    extraProvide: {
      ...methods,
      isHidden(option) {
        return isHidden ? isHidden(option) : false;
      },
      isActive(vm) {
        return activateMethods.isActive(vm);
      },
      activate(vm) {
        activateMethods.activate(vm);
      },
      deactivate() {
        activateMethods.deactivate();
      },
    },
  });
  const { methods: activateMethods, handlers: activateHandlers } = useActivateOption(context, props);

  return {
    methods,
    activateMethods,
    activateHandlers,
    valueToChild,
    valueToLabel,
    context,
  };
}
