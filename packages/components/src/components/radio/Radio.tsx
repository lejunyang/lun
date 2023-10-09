import { defineSSRCustomFormElement } from 'custom';
import { GlobalStaticConfig } from 'config';
import { computed } from 'vue';
import { useSetupEdit } from '@lun/core';
import { createDefineElement, getCommonElementOptions, setDefaultsForPropOptions } from 'utils';
import { useSetupContextEvent, useVModelCompatible } from 'hooks';
import { RadioCollector } from '.';
import { radioProps } from './type';

export const Radio = defineSSRCustomFormElement({
  ...getCommonElementOptions('radio'),
  props: setDefaultsForPropOptions(radioProps, GlobalStaticConfig.defaultProps.radio),
  emits: ['update'],
  setup(props, { emit }) {
    useSetupContextEvent();
    const [editComputed] = useSetupEdit();
    const [updateVModel] = useVModelCompatible();
    const radioContext = RadioCollector.child();
    const checked = computed(() => {
      if (!radioContext?.parent) return props.checked;
      const { looseEqual } = radioContext.parent.props;
      const { value } = radioContext.valueModel;
      return looseEqual ? value == props.value : value === props.value;
    });
    const handler = {
      onChange() {
        emit('update', props.value);
        updateVModel(props.value);
      },
    };
    return () => {
      const labelPart = (
        <span part="label">
          <slot>{props.label}</slot>
        </span>
      );
      return (
        <>
          <label part="wrapper">
            {props.labelPosition === 'start' && labelPart}
            <span>
              <input
                part="radio"
                type="radio"
                checked={checked.value}
                value={props.value}
                readonly={editComputed.value.readonly}
                disabled={editComputed.value.disabled}
                onChange={handler.onChange}
              />
            </span>
            {props.labelPosition === 'end' && labelPart}
          </label>
        </>
      );
    };
  },
});

declare module 'vue' {
  export interface GlobalComponents {
    LRadio: typeof Radio;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-radio': typeof Radio;
  }
}

export const defineRadio = createDefineElement('radio', Radio);
