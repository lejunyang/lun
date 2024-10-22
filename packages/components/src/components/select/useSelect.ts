import { useSelectMethods } from '@lun/core';
import { Ref } from 'vue';
import { CommonProcessedOption, useValueSet, useCollectorValue } from 'hooks';
import { SelectCollector } from './collector';
import { useActivateOption } from './useActivateOption';

export function useSelect(
  props: { upDownToggle?: boolean; autoActivateFirst?: boolean; multiple?: boolean },
  valueModel: Ref<{ value: any; raw?: any }>,
  {
    isHidden,
    onSingleSelect,
  }: {
    isHidden?: (option: CommonProcessedOption) => boolean;
    onSingleSelect?: (value: string) => void;
  } = {},
) {
  const isMultiple = () => props.multiple,
    selectedValueSet = useValueSet(valueModel, isMultiple);
  const [childrenInfo, valueToChild, valueToLabel] = useCollectorValue(() => context);

  const methods = useSelectMethods({
    multiple: isMultiple,
    value: selectedValueSet,
    onChange(value) {
      valueModel.value = value;
      if (onSingleSelect && !isMultiple()) onSingleSelect(value.raw);
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
