import { defineSSRCustomFormElement } from 'custom';
import { useCheckbox, useSetupEdit } from '@lun/core';
import { createDefineElement } from 'utils';
import { useCEExpose, useOptions, useSetupContextEvent, useVModelCompatible, useValueModel } from 'hooks';
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
            // nullish value, checkForAll, excludeFromGroup, disabled checkbox will be excluded from children values
            i.props.value != null && !i.props.checkForAll && !i.props.excludeFromGroup && !i.exposed?.disabled
              ? [i.props.value]
              : [],
          ),
        ),
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

    const { render } = useOptions(props, 'checkbox');
    return () => (
      <>
        {render.value}
        <slot></slot>
      </>
    );
  },
});

export type tCheckboxGroup = typeof CheckboxGroup;

export const defineCheckboxGroup = createDefineElement('checkbox-group', CheckboxGroup);
