import { defineSSRCustomFormElement } from 'custom';
import { computed } from 'vue';
import { useSetupEdit } from '@lun/core';
import { createDefineElement } from 'utils';
import { useNamespace, useSetupContextEvent } from 'hooks';
import { RadioCollector } from '.';
import { radioEmits, radioProps } from './type';

const name = 'radio';
export const Radio = defineSSRCustomFormElement({
  name,
  props: radioProps,
  emits: radioEmits,
  setup(props, { emit }) {
    const ns = useNamespace(name);
    useSetupContextEvent();
    const [editComputed] = useSetupEdit();
    const radioContext = RadioCollector.child();
    const checked = computed(() => {
      if (!radioContext?.parent) return props.checked;
      const { value } = radioContext.valueModel;
      return value === props.value;
    });
    const handler = {
      onChange() {
        emit('update', props.value);
      },
    };
    return () => {
      const labelPart = (
        <span part={ns.p('label')} class={ns.e('label')}>
          <slot>{props.label}</slot>
        </span>
      );
      return (
        <>
          <label part={ns.p('root')} class={[...ns.s(editComputed), ns.is('checked', checked.value)]}>
            {props.labelPosition === 'start' && labelPart}
            <input
              type={name}
              checked={checked.value}
              value={props.value}
              readonly={editComputed.value.readonly}
              disabled={editComputed.value.disabled}
              onChange={handler.onChange}
              hidden
            />
            <span class={ns.e('indicator')} part={ns.p('indicator')}></span>
            {props.labelPosition === 'end' && labelPart}
          </label>
        </>
      );
    };
  },
});

export type tRadio = typeof Radio;

export const defineRadio = createDefineElement(name, Radio);
