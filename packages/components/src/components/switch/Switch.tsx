import { defineSSRCustomFormElement } from 'custom';
import { useSetupEdit } from '@lun/core';
import { createDefineElement } from 'utils';
import { useNamespace, useSetupContextEvent, useVModelCompatible } from 'hooks';
import { switchProps } from './type';

const name = 'switch';
export const Switch = defineSSRCustomFormElement({
  name,
  props: switchProps,
  emits: ['update'],
  setup(props, { emit }) {
    const ns = useNamespace(name);
    useSetupContextEvent();
    const [editComputed] = useSetupEdit();
    const [updateVModel] = useVModelCompatible();

    const inputHandlers = {
      onChange(e: Event) {
        const { checked } = e.target as HTMLInputElement;
        const value = checked ? props.trueValue : props.falseValue;
        emit('update', {
          value,
          checked,
        });
        updateVModel(value);
      },
    };

    return () => {
      return (
        <>
          <label part="root">
            <input
              part="input"
              type="checkbox"
              role="switch"
              checked={props.checked}
              aria-checked={props.checked}
              readonly={editComputed.value.readonly}
              disabled={editComputed.value.disabled}
              hidden
              {...inputHandlers}
            />
            <span part="wrapper">
              <span part="thumb"></span>
            </span>
          </label>
        </>
      );
    };
  },
});

declare module 'vue' {
  export interface GlobalComponents {
    LSwitch: typeof Switch;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-switch': typeof Switch;
  }
}

export const defineSwitch = createDefineElement(name, Switch);
