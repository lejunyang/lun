import { defineSSRCustomFormElement } from 'custom';
import { useSetupEdit } from '@lun/core';
import { createDefineElement } from 'utils';
import { useOptions, useSetupContextEvent, useVModelCompatible, useValueModel } from 'hooks';
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
        updateVModel(value);
      },
    });
    useSetupEdit();
    const [updateVModel] = useVModelCompatible();
    RadioCollector.parent({ extraProvide: { valueModel } });

    const { render } = useOptions(props, 'radio');
    return () => (
      <>
        {render()}
        <slot></slot>
      </>
    );
  },
});

export type tRadioGroup = typeof RadioGroup;

export const defineRadioGroup = createDefineElement('radio-group', RadioGroup);
