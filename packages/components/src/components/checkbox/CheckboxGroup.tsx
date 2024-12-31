import { defineCustomElement } from 'custom';
import { useCheckboxMethods, useSetupEdit, useSetupEvent } from '@lun-web/core';
import { createDefineElement } from 'utils';
import { useValueSet, useCEExpose, useCEStates, useNamespace, useOptions, useValueModel } from 'hooks';
import { CheckboxCollector } from './collector';
import { computed } from 'vue';
import { CheckboxUpdateDetail, checkboxGroupEmits, checkboxGroupProps } from './type';
import { getCompParts } from 'common';

const name = 'checkbox-group';
const parts = ['root'] as const;
const compParts = getCompParts(name, parts);
export const CheckboxGroup = defineCustomElement({
  name,
  props: checkboxGroupProps,
  emits: checkboxGroupEmits,
  formAssociated: true,
  setup(props, { emit: e }) {
    useNamespace(name);
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
        Object.assign(value, radioState);
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
    const checkbox = useCheckboxMethods({
        current: checkedValueSet,
        allValues: childValueSet,
        onChange(value) {
          valueModel.value = value as any;
        },
      }),
      [radioState, methods] = checkbox;

    useCEExpose(methods);

    useSetupEdit();
    const children = CheckboxCollector.parent({ extraProvide: checkbox });

    const [stateClass] = useCEStates(() => ({
      vertical: props.vertical,
    }));

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
export type CheckboxGroupExpose = ReturnType<typeof useCheckboxMethods>;
export type iCheckboxGroup = InstanceType<tCheckboxGroup> & CheckboxGroupExpose;

export const defineCheckboxGroup = createDefineElement(name, CheckboxGroup, {}, parts);
