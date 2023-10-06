import { defineSSRCustomFormElement } from 'custom';
import { GlobalStaticConfig } from 'config';
import { PropType, computed } from 'vue';
import { useSetupEdit } from '@lun/core';
import { setDefaultsForPropOptions } from 'utils';
import { editStateProps } from 'common';
import { useSetupContextEvent, useVModelCompatible } from 'hooks';
import { RadioCollector } from '.';

export const Radio = defineSSRCustomFormElement({
  name: GlobalStaticConfig.nameMap.radio,
  props: {
    ...editStateProps,
    ...setDefaultsForPropOptions(
      {
        value: {},
        label: { type: String },
        labelPosition: { type: String as PropType<LogicalPosition> },
        checked: { type: Boolean },
      },
      GlobalStaticConfig.defaultProps.radio
    ),
  },
  styles: GlobalStaticConfig.computedStyles.radio,
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
    return () => (
      <>
        <label part="label">
        {props.labelPosition === 'start' && (
            <span part="label">
              <slot>{props.label}</slot>
            </span>
          )}
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
          {props.labelPosition === 'end' && (
            <span part="label">
              <slot>{props.label}</slot>
            </span>
          )}
        </label>
      </>
    );
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

export function defineRadio(name?: string) {
  name ||= GlobalStaticConfig.nameMap.radio;
  if (!customElements.get(name)) {
    GlobalStaticConfig.actualNameMap['radio'].add(name);
    customElements.define(name, Radio);
  }
}
