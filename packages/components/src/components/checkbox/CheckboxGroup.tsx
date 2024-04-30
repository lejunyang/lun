import { defineSSRCustomElement } from 'custom';
import { useCheckboxMethods, useSetupEdit, useSetupEvent } from '@lun/core';
import { createDefineElement } from 'utils';
import { useCEExpose, useCEStates, useNamespace, useOptions, useValueModel } from 'hooks';
import { CheckboxCollector } from './collector';
import { computed } from 'vue';
import { toArrayIfNotNil } from '@lun/utils';
import { CheckboxUpdateDetail, checkboxGroupEmits, checkboxGroupProps } from './type';

const name = 'checkbox-group';
export const CheckboxGroup = defineSSRCustomElement({
  name,
  props: checkboxGroupProps,
  emits: checkboxGroupEmits,
  formAssociated: true,
  setup(props, { emit }) {
    const ns = useNamespace(name);
    useSetupEvent({
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
      },
    });
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
    const methods = useCheckboxMethods({
      valueSet: checkedValueSet,
      allValues: childValueSet,
      onChange(value) {
        valueModel.value = value;
      },
    });

    useCEExpose(methods);

    const [editComputed] = useSetupEdit();
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

    const [stateClass] = useCEStates(
      () => ({
        vertical: props.vertical,
      }),
      ns,
      editComputed,
    );

    const { render } = useOptions(props, 'checkbox');
    return () => (
      <span part="root" class={stateClass.value}>
        {render.value}
        <slot></slot>
      </span>
    );
  },
});

export type tCheckboxGroup = typeof CheckboxGroup;
export type iCheckboxGroup = InstanceType<tCheckboxGroup> & ReturnType<typeof useCheckboxMethods>;

export const defineCheckboxGroup = createDefineElement(name, CheckboxGroup);
