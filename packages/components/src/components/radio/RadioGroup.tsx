import { defineSSRCustomFormElement } from 'custom';
import { useSetupEdit } from '@lun/core';
import { createDefineElement } from 'utils';
import { useOptions, useSetupContextEvent, useValueModel } from 'hooks';
import { RadioCollector } from '.';
import { radioEmits, radioGroupProps } from './type';

const name = 'radio-group';
export const RadioGroup = defineSSRCustomFormElement({
  name,
  props: radioGroupProps,
  emits: radioEmits,
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
    return () => (
      <>
        {render.value}
        <slot></slot>
      </>
    );
  },
});

export type tRadioGroup = typeof RadioGroup;

export const defineRadioGroup = createDefineElement(name, RadioGroup);
