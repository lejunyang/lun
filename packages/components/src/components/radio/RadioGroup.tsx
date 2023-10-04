import { defineSSRCustomFormElement } from 'custom';
import { GlobalStaticConfig } from 'config';
import { useSetupEdit } from '@lun/core';
import { setDefaultsForPropOptions } from 'utils';
import { editStateProps } from 'common';
import { useSetupContextEvent, useVModelCompatible, useValueModel } from 'hooks';
import { RadioCollector } from '.';

export const RadioGroup = defineSSRCustomFormElement({
  name: GlobalStaticConfig.nameMap['radio-group'],
  props: {
    ...editStateProps,
    ...setDefaultsForPropOptions(
      {
        value: {},
        looseEqual: { type: Boolean },
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
        emit('update', value);
        updateVModel(value);
      }
    });
    useSetupEdit();
    const { updateVModel } = useVModelCompatible();
    RadioCollector.parent({ valueModel });
    return () => (
      <>
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
