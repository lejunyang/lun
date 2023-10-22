import { defineSSRCustomFormElement } from 'custom';
import { useSetupEdit } from '@lun/core';
import { createDefineElement, renderElement } from 'utils';
import { useCEExpose, useSetupContextEvent, useVModelCompatible, useValueModel } from 'hooks';
import { CheckboxCollector } from '.';
import { computed } from 'vue';
import { toArrayIfNotNil, toNoneNilSet } from '@lun/utils';
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
    const checkedValueSet = computed(() => new Set(toArrayIfNotNil(props.value)));

    const methods = {
      isChecked: (value: any) =>
        props.looseEqual
          ? !!toArrayIfNotNil(props.value).find((i: any) => i == value)
          : checkedValueSet.value.has(value),
      checkAll() {
        valueModel.value = Array.from(childValueSet.value);
      },
      uncheckAll() {
        valueModel.value = [];
      },
      check(...values: any[]) {
        const valueSet = toNoneNilSet(valueModel.value, values);
        valueModel.value = Array.from(valueSet);
      },
      uncheck(...values: any[]) {
        const valueSet = new Set(checkedValueSet.value);
        values.forEach((i) => valueSet.delete(i));
        valueModel.value = Array.from(valueSet);
      },
      reverse() {
        const valueSet = new Set(checkedValueSet.value);
        childValueSet.value.forEach((i) => {
          if (valueSet.has(i)) valueSet.delete(i);
          else valueSet.add(i);
        });
        valueModel.value = Array.from(valueSet);
      },
    };

    useCEExpose(methods);

    useSetupContextEvent({
      update({ isCheckForAll, checked, value, onlyFor, excludeFromGroup }: CheckboxUpdateDetail) {
        if (excludeFromGroup || (props.onlyFor && props.onlyFor !== onlyFor)) return; // if 'onlyFor' is defined, accepts update event only with same value
        const current = toArrayIfNotNil(valueModel.value);
        if (isCheckForAll) {
          if (checked) methods.checkAll();
          else methods.uncheckAll();
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
    const childValueSet = computed(
      () =>
        new Set(
          children.value.flatMap((i) =>
            i.props.value != null && !i.props.checkForAll && !i.props.excludeFromGroup ? [i.props.value] : []
          )
        )
    );
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
