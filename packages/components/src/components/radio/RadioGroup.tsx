import { defineSSRCustomFormElement } from 'custom';
import { GlobalStaticConfig } from 'config';
import { useSetupEdit } from '@lun/core';
import { setDefaultsForPropOptions } from 'utils';
import { editStateProps } from 'common';
import { useSetupContextEvent, useVModelCompatible, useValueModel } from 'hooks';
import { RadioCollector } from '.';
import { PropType, h } from 'vue';

export type RadioOptions = { label: string; value: any }[];

export const RadioGroup = defineSSRCustomFormElement({
  name: GlobalStaticConfig.nameMap['radio-group'],
  props: {
    ...editStateProps,
    ...setDefaultsForPropOptions(
      {
        value: {},
        looseEqual: { type: Boolean },
        options: { type: Array as PropType<RadioOptions> },
      },
      GlobalStaticConfig.defaultProps['radio-group']
    ),
  },
  styles: GlobalStaticConfig.computedStyles['radio-group'],
  emits: ['update'],
  setup(props, { emit }) {
    const valueModel = useValueModel(props, { passive: true });
    useSetupContextEvent({
      update(value) {
        valueModel.value = value;
        updateVModel(value);
      },
    });
    useSetupEdit();
    const { updateVModel } = useVModelCompatible();
    RadioCollector.parent({ valueModel });
    const childName = GlobalStaticConfig.actualNameMap.radio.values().next().value;
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
    LRadioGroup: typeof RadioGroup;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-radio-group': typeof RadioGroup;
  }
}

export function defineRadioGroup(name?: string) {
  name ||= GlobalStaticConfig.nameMap['radio-group'];
  if (!customElements.get(name)) {
    GlobalStaticConfig.actualNameMap['radio-group'].add(name);
    customElements.define(name, RadioGroup);
  }
}
