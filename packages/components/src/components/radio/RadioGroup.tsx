import { defineSSRCustomFormElement } from 'custom';
import { useSetupEdit } from '@lun/core';
import { createDefineElement } from 'utils';
import { useOptions, useSetupContextEvent, useValueModel } from 'hooks';
import { RadioCollector } from '.';
import { radioGroupProps } from './type';

export const RadioGroup = defineSSRCustomFormElement({
  name: 'radio-group',
  props: radioGroupProps,
  emits: ['update'],
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

export const defineRadioGroup = createDefineElement('radio-group', RadioGroup);
