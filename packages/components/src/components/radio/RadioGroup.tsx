import { defineSSRCustomFormElement } from 'custom';
import { useSetupEdit } from '@lun/core';
import { createDefineElement, renderElement } from 'utils';
import { useSetupContextEvent, useVModelCompatible, useValueModel } from 'hooks';
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
    return () => (
      <>
        {Array.isArray(props.options) &&
          props.options.map((i, index) => renderElement('radio', { value: i.value, key: i.value + index }, i.label))}
        <slot></slot>
      </>
    );
  },
});

export const defineRadioGroup = createDefineElement('radio-group', RadioGroup);
