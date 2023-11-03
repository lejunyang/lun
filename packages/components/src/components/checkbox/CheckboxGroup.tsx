import { defineSSRCustomFormElement } from 'custom';
import { useCheckbox, useSetupEdit } from '@lun/core';
import { createDefineElement, renderElement } from 'utils';
import { useCEExpose, useSetupContextEvent, useVModelCompatible, useValueModel } from 'hooks';
import { CheckboxCollector } from '.';
import { computed } from 'vue';
import { toArrayIfNotNil } from '@lun/utils';
import { CheckboxUpdateDetail, checkboxGroupProps } from './type';

export const CheckboxGroup = defineSSRCustomFormElement({
  name: 'checkbox-group',
  props: checkboxGroupProps,
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
    const checkedValueSet = computed(() => new Set(toArrayIfNotNil(valueModel.value)));

    const childValueSet = computed(
      () =>
        new Set(
          children.value.flatMap((i) =>
            i.props.value != null && !i.props.checkForAll && !i.props.excludeFromGroup ? [i.props.value] : []
          )
        )
    );
    const methods = useCheckbox({
      value: valueModel,
      valueSet: checkedValueSet,
      allValues: childValueSet,
      onChange(value) {
        valueModel.value = value;
      },
    });

    useCEExpose(methods);

    useSetupContextEvent({
      update({ isCheckForAll, checked, value, onlyFor, excludeFromGroup }: CheckboxUpdateDetail) {
        if (excludeFromGroup || (props.onlyFor && props.onlyFor !== onlyFor)) return; // if 'onlyFor' is defined, accepts update event only with same value
        if (isCheckForAll) {
          if (checked) methods.checkAll();
          else methods.uncheckAll();
        } else {
          if (value == null) return;
          if (checked) methods.check(value);
          else methods.uncheck(value);
        }
        updateVModel(valueModel.value);
      },
    });
    useSetupEdit();
    const [updateVModel] = useVModelCompatible();
    const radioState = computed(() => {
      let allChecked: boolean | null = null,
        intermediate = false;
      childValueSet.value.forEach((v) => {
        if (methods.isChecked(v)) {
          if (allChecked === null) allChecked = true;
          intermediate = true;
        } else allChecked = false;
      });
      if (allChecked) intermediate = false;
      return {
        allChecked: !!allChecked,
        intermediate,
        parentValueSet: checkedValueSet.value,
        isChecked: methods.isChecked,
      };
    });
    const children = CheckboxCollector.parent({ extraProvide: { radioState } });
    return () => (
      <>
        {Array.isArray(props.options) &&
          props.options.map((i, index) =>
            renderElement('checkbox', { value: i.value, key: i.value + index, onlyFor: props.onlyFor }, i.label)
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
