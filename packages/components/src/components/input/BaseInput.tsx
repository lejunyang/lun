import { useInput, useSetupEdit } from '@lun/core';
import { defineSSRCustomFormElement } from 'custom';
import { createDefineComp, getCommonCompOptions, setDefaultsForPropOptions } from 'utils';
import { GlobalStaticConfig } from 'config';
import { useSetupContextEvent, useVModelCompatible } from 'hooks';
import { baseInputProps } from './type';

export const BaseInput = defineSSRCustomFormElement({
  ...getCommonCompOptions('base-input'),
  props: setDefaultsForPropOptions(baseInputProps, GlobalStaticConfig.defaultProps['base-input']),
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

declare module 'vue' {
  export interface GlobalComponents {
    LBaseInput: typeof BaseInput;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-base-input': typeof BaseInput;
  }
}

export const defineBaseInput = createDefineComp('base-input', BaseInput);
