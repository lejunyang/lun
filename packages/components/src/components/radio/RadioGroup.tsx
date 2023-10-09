import { defineSSRCustomFormElement } from 'custom';
import { GlobalStaticConfig } from 'config';
import { useSetupEdit } from '@lun/core';
import { createDefineElement, getCommonElementOptions, setDefaultsForPropOptions } from 'utils';
import { useSetupContextEvent, useVModelCompatible, useValueModel } from 'hooks';
import { RadioCollector } from '.';
import { h } from 'vue';
import { radioGroupProps } from './type';

export const RadioGroup = defineSSRCustomFormElement({
  ...getCommonElementOptions('radio-group'),
  props: setDefaultsForPropOptions(radioGroupProps, GlobalStaticConfig.defaultProps['radio-group']),
  emits: ['update'],
  setup(props) {
    const valueModel = useValueModel(props, { passive: true });
    useSetupContextEvent({
      update(value) {
        valueModel.value = value;
        updateVModel(value);
      },
    });
    useSetupEdit();
    const [updateVModel] = useVModelCompatible();
    RadioCollector.parent({ extraProvide: { valueModel } });
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

export const defineRadioGroup = createDefineElement('radio-group', RadioGroup);
