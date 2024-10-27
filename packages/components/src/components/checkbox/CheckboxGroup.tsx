import { defineSSRCustomElement } from 'custom';
import { objectComputed, useCheckboxMethods, useSetupEdit, useSetupEvent } from '@lun-web/core';
import { createDefineElement } from 'utils';
import { useValueSet, useCEExpose, useCEStates, useNamespace, useOptions, useValueModel } from 'hooks';
import { CheckboxCollector } from './collector';
import { computed } from 'vue';
import { pick } from '@lun-web/utils';
import { CheckboxUpdateDetail, checkboxGroupEmits, checkboxGroupProps } from './type';
import { getCompParts } from 'common';

const name = 'checkbox-group';
const parts = ['root'] as const;
const compParts = getCompParts(name, parts);
export const CheckboxGroup = defineSSRCustomElement({
  name,
  props: checkboxGroupProps,
  emits: checkboxGroupEmits,
  formAssociated: true,
  setup(props, { emit: e }) {
    const ns = useNamespace(name);
    const emit = useSetupEvent<typeof e>({
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
      hasRaw: true,
      emit: (name, value) => {
        Object.assign(value, pick(radioState, ['allChecked', 'intermediate']));
        emit(name as any, value);
      },
    });
    const checkedValueSet = useValueSet(valueModel, true);

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
      value: checkedValueSet,
      allValues: childValueSet,
      onChange(value) {
        valueModel.value = value;
      },
    });

    useCEExpose(methods);

    useSetupEdit();
    const radioState = objectComputed(() => {
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
    );

    const { render } = useOptions(props, 'checkbox');
    return () => (
      <span part={compParts[0]} class={stateClass.value}>
        {render.value}
        <slot></slot>
      </span>
    );
  },
});

export type tCheckboxGroup = typeof CheckboxGroup;
export type CheckboxExpose = ReturnType<typeof useCheckboxMethods>;
export type iCheckboxGroup = InstanceType<tCheckboxGroup> & CheckboxExpose;

export const defineCheckboxGroup = createDefineElement(name, CheckboxGroup, {}, parts);
