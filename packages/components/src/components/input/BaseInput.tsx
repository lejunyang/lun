import { useInput, useSetupEdit } from '@lun/core';
import { defineSSRCustomFormElement } from 'custom';
import { createDefineElement } from 'utils';
import { useSetupContextEvent, useVModelCompatible } from 'hooks';
import { baseInputProps } from './type';

export const BaseInput = defineSSRCustomFormElement({
  name: 'base-input',
  props: baseInputProps,
  inheritAttrs: false,
  emits: ['update', 'enterDown'],
  setup(props, { emit, attrs }) {
    useSetupContextEvent();
    const [editComputed] = useSetupEdit();
    const [updateVModel] = useVModelCompatible();

    const [inputHandlers] = useInput(() => ({
      ...attrs,
      ...props,
      onChange: (val) => {
        updateVModel(val);
        emit('update', val);
      },
      onEnterDown(e) {
        emit('enterDown', e);
      },
    }));

    return () => (
      <input
        {...attrs}
        type={props.type === 'number-text' ? 'tel' : props.type}
        part="input"
        class={['l-base-input']}
        value={props.value}
        placeholder={props.placeholder}
        disabled={editComputed.value.disabled}
        readonly={editComputed.value.readonly}
        {...inputHandlers}
      />
    );
  },
});

export const defineBaseInput = createDefineElement('base-input', BaseInput);
