import { defineSSRCustomFormElement } from 'custom';
import { GlobalStaticConfig } from 'config';
import { useSetupEdit } from '@lun/core';
import { createDefineElement, getCommonElementOptions, setDefaultsForPropOptions } from 'utils';
import { useSetupContextEvent, useVModelCompatible, useValueModel } from 'hooks';
import { CheckboxCollector } from '.';
import { computed, h } from 'vue';
import { toArrayIfNotNil } from '@lun/utils';
import { CheckboxUpdateDetail, checkboxGroupProps } from './type';

export const CheckboxGroup = defineSSRCustomFormElement({
  ...getCommonElementOptions('checkbox'),
  props: setDefaultsForPropOptions(checkboxGroupProps, GlobalStaticConfig.defaultProps['checkbox-group']),
  emits: ['update'],
  setup(props, { emit }) {
    const valueModel = useValueModel(props, {
      passive: true,
      emit: (name, value) => {
        emit(name as any, {
          value,
          allChecked: radioState.value.allChecked,
          intermediate: radioState.value.intermediate,
        });
      },
    });
    useSetupContextEvent({
      update({ isCheckForAll, checked, value, onlyFor, excludeFromGroup }: CheckboxUpdateDetail) {
        if (excludeFromGroup || (props.onlyFor && props.onlyFor !== onlyFor)) return; // if 'onlyFor' is defined, accepts update event only with same value
        const current = toArrayIfNotNil(valueModel.value);
        if (isCheckForAll) {
          if (checked) {
            valueModel.value = Array.from(childValueSet.value);
          } else valueModel.value = [];
        } else {
          if (value == null) return;
          if (checked) {
            const index = current.findIndex((i) => (props.looseEqual ? i == value : i === value));
            if (index === -1) valueModel.value = current.concat(value);
          } else {
            valueModel.value = current.filter((i) => (props.looseEqual ? i != value : i !== value));
          }
        }
        updateVModel(valueModel.value);
      },
    });
    useSetupEdit();
    const [updateVModel] = useVModelCompatible();
    const radioState = computed(() => {
      let allChecked: boolean | null = null,
        intermediate = false;
      const parentValueArray = toArrayIfNotNil(valueModel.value);
      const parentValueSet = new Set(parentValueArray);
      childValueSet.value.forEach((v) => {
        if (props.looseEqual ? parentValueArray.find((p) => p == v) : parentValueSet.has(v)) {
          if (allChecked === null) allChecked = true;
          intermediate = true;
        } else allChecked = false;
      });
      if (allChecked) intermediate = false;
      return {
        allChecked: !!allChecked,
        intermediate,
        parentValueSet,
      };
    });
    const children = CheckboxCollector.parent({ extraProvide: { radioState } });
    const childValueSet = computed(
      () =>
        new Set(
          children.value.flatMap((i) =>
            i.props.value != null && !i.props.checkForAll && !i.props.excludeFromGroup ? [i.props.value] : []
          )
        )
    );
    const childName = GlobalStaticConfig.actualNameMap.checkbox.values().next().value;
    return () => (
      <>
        {Array.isArray(props.options) &&
          props.options.map((i, index) =>
            h(childName, { value: i.value, key: i.value + index, onlyFor: props.onlyFor }, i.label)
          )}
        <slot></slot>
      </>
    );
  },
});

declare module 'vue' {
  export interface GlobalComponents {
    LCheckboxGroup: typeof CheckboxGroup;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-checkbox-group': typeof CheckboxGroup;
  }
}

export const defineCheckboxGroup = createDefineElement('checkbox-group', CheckboxGroup);
