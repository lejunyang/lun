import { useSelectMethods } from '@lun-web/core';
import { Ref } from 'vue';
import { CommonProcessedOption, useValueSet, useChildrenValue } from 'hooks';
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
  const [childSetup, childrenValues, , valueToChild, valueToLabel] = useChildrenValue();

  const [, methods] = useSelectMethods({
    multiple: isMultiple,
    current: selectedValueSet,
    onChange(value) {
      valueModel.value = value;
      if (onSingleSelect && !isMultiple()) onSingleSelect(value.raw as string);
    },
    allValues: childrenValues,
  });
  const context = SelectCollector.parent({
    childSetup,
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
