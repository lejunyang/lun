import { defineSSRCustomFormElement } from 'custom';
import { GlobalStaticConfig } from 'config';
import { useSetupEdit } from '@lun/core';
import { setDefaultsForPropOptions } from 'utils';
import { editStateProps } from 'common';
import { useSetupContextEvent, useVModelCompatible, useValueModel } from 'hooks';
import { CheckboxCollector } from '.';
import { CheckboxChangeDetail } from './Checkbox';
import { PropType, computed, h } from 'vue';
import { toArrayIfNotNil } from '@lun/utils';

export type CheckboxOptions = { label: string; value: any }[];

export const CheckboxGroup = defineSSRCustomFormElement({
  name: GlobalStaticConfig.nameMap['checkbox-group'],
  props: {
    ...editStateProps,
    ...setDefaultsForPropOptions(
      {
        value: { type: Array },
        looseEqual: { type: Boolean },
        options: { type: Array as PropType<CheckboxOptions> },
      },
      GlobalStaticConfig.defaultProps['checkbox-group']
    ),
  },
  styles: GlobalStaticConfig.computedStyles['checkbox-group'],
  emits: ['update'],
  setup(props) {
    const valueModel = useValueModel(props, { passive: true });
    useSetupContextEvent({
      update({ isCheckForAll, checked, value }: CheckboxChangeDetail) {
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
    const { updateVModel } = useVModelCompatible();
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
    const children = CheckboxCollector.parent({ radioState });
    const childValueSet = computed(
      () =>
        new Set(children.value.flatMap((i) => (i.props.value != null && !i.props.checkForAll ? [i.props.value] : [])))
    );
    const childName = GlobalStaticConfig.actualNameMap.checkbox.values().next().value;
    return () => (
      <>
        {Array.isArray(props.options) &&
          props.options.map((i, index) => h(childName, { value: i.value, key: i.value + index }, i.label))}
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

export function defineCheckboxGroup(name?: string) {
  name ||= GlobalStaticConfig.nameMap['checkbox-group'];
  if (!customElements.get(name)) {
    GlobalStaticConfig.actualNameMap['checkbox-group'].add(name);
    customElements.define(name, CheckboxGroup);
  }
}
