import { useSelectMethods } from '@lun/core';
import { ComponentInternalInstance, Ref, WritableComputedRef, computed, toRef } from 'vue';
import { CommonProcessedOption } from 'hooks';
import { SelectCollector } from './collector';
import { useActivateOption } from './useActivateOption';
import { toArrayIfNotNil } from '@lun/utils';

export function useSelect(
  props: { upDownToggle?: boolean; autoActivateFirst?: boolean; multiple?: boolean },
  valueModel: WritableComputedRef<string | string[] | null | undefined> | Ref<string | string[] | null | undefined>,
  isHidden?: (option: CommonProcessedOption) => boolean,
) {
  const selectedValueSet = computed(() => new Set(toArrayIfNotNil(valueModel.value)));
  const childrenInfo = computed(() => {
    const childrenValuesSet = new Set<any>();
    const valueToChildMap = new Map<any, ComponentInternalInstance>();
    context.value.forEach((child) => {
      const { value } = child.props;
      if (value != null) {
        !child.exposed?.disabled && childrenValuesSet.add(value); // exclude disabled option from value set
        valueToChildMap.set(value, child);
      }
    });
    return { childrenValuesSet, valueToChildMap };
  });
  const valueToChild = (value: any) => childrenInfo.value.valueToChildMap.get(value);

  const methods = useSelectMethods({
    multiple: toRef(props, 'multiple'),
    valueSet: selectedValueSet,
    onChange(value) {
      valueModel.value = value;
    },
    allValues: () => childrenInfo.value.childrenValuesSet,
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
    context,
  };
}
