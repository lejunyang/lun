import { defineCustomElement } from 'custom';
import { useCheckboxMethods, useSetupEdit, useSetupEvent } from '@lun-web/core';
import { createDefineElement } from 'utils';
import {
  useValueSet,
  useCEExpose,
  useCEStates,
  useNamespace,
  useOptions,
  useValueModel,
  useChildrenValue,
} from 'hooks';
import { CheckboxCollector } from './collector';
import { CheckboxSetupProps, CheckboxUpdateDetail, checkboxGroupEmits, checkboxGroupProps } from './type';
import { ElementWithExpose, getCompParts } from 'common';
import { defineCheckbox } from './Checkbox';

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

    const [childSetup, childrenValues] = useChildrenValue<CheckboxSetupProps>(
      (childProps) => childProps.checkForAll || childProps.excludeFromGroup,
    );

    const checkbox = useCheckboxMethods({
        current: checkedValueSet,
        allValues: childrenValues,
        onChange(value) {
          valueModel.value = value as any;
        },
      }),
      [radioState, methods] = checkbox;

    useCEExpose(methods);

    useSetupEdit();
    CheckboxCollector.parent({ extraProvide: checkbox, childSetup });

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

export type CheckboxGroupExpose = ReturnType<typeof useCheckboxMethods>;
export type tCheckboxGroup = ElementWithExpose<typeof CheckboxGroup, CheckboxGroupExpose>;
export type iCheckboxGroup = InstanceType<tCheckboxGroup> & CheckboxGroupExpose;

export const defineCheckboxGroup = createDefineElement(name, CheckboxGroup, {}, parts, [defineCheckbox]);
