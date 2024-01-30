import { defineSSRCustomElement } from 'custom';
import { useSetupEdit } from '@lun/core';
import { createDefineElement } from 'utils';
import { useOptions, useSetupContextEvent, useValueModel } from 'hooks';
import { RadioCollector } from '.';
import { radioEmits, radioGroupProps } from './type';

const name = 'radio-group';
export const RadioGroup = defineSSRCustomElement({
  name,
  props: radioGroupProps,
  emits: radioEmits,
  formAssociated: true,
  setup(props) {
    const valueModel = useValueModel(props);
    useSetupContextEvent({
      update(value) {
        valueModel.value = value;
      },
    });
    useSetupEdit();
    RadioCollector.parent({ extraProvide: { valueModel } });

    const { render } = useOptions(props, 'radio');
    // TODO arrow move to check prev/next active radio
    return () => (
      <>
        {render.value}
        <slot></slot>
      </>
    );
  },
});

export type tRadioGroup = typeof RadioGroup;
export type iRadioGroup = InstanceType<tRadioGroup>;

export const defineRadioGroup = createDefineElement(name, RadioGroup);
