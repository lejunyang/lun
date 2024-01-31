import { defineSSRCustomElement } from 'custom';
import { computed } from 'vue';
import { useSetupEdit } from '@lun/core';
import { createDefineElement } from 'utils';
import { useCEStates, useNamespace, useSetupContextEvent } from 'hooks';
import { RadioCollector } from '.';
import { radioEmits, radioProps } from './type';

const name = 'radio';
export const Radio = defineSSRCustomElement({
  name,
  props: radioProps,
  emits: radioEmits,
  formAssociated: true,
  setup(props, { emit }) {
    useSetupContextEvent();
    const [editComputed] = useSetupEdit();
    const radioContext = RadioCollector.child();
    const ns = useNamespace(name, { parent: radioContext?.parent });
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

    const [stateClass] = useCEStates(
      () => {
        const button = radioContext?.parent?.props.type === 'button';
        return {
          checked,
          button,
          start: button && (props.start || radioContext?.isStart),
          end: button && (props.end || radioContext?.isEnd),
        };
      },
      ns,
      editComputed,
    );
    return () => {
      const labelPart = (
        <span part={ns.p('label')} class={ns.e('label')}>
          <slot>{props.label}</slot>
        </span>
      );
      return (
        <label part={ns.p('root')} class={stateClass.value}>
          {props.labelPosition === 'start' && labelPart}
          <input
            type={name}
            checked={checked.value}
            value={props.value}
            disabled={editComputed.value.disabled}
            onChange={handler.onChange}
            hidden
          />
          {!props.noIndicator && <span class={ns.e('indicator')} part={ns.p('indicator')}></span>}
          {props.labelPosition === 'end' && labelPart}
        </label>
      );
    };
  },
});

export type tRadio = typeof Radio;

export const defineRadio = createDefineElement(name, Radio);
