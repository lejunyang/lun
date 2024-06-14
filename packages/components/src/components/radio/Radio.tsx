import { defineSSRCustomElement } from 'custom';
import { computed } from 'vue';
import { useSetupEdit, useSetupEvent } from '@lun/core';
import { createDefineElement } from 'utils';
import { useCEStates, useNamespace } from 'hooks';
import { RadioCollector } from './collector';
import { radioEmits, radioProps } from './type';
import { virtualGetMerge } from '@lun/utils';

const name = 'radio';
export const Radio = defineSSRCustomElement({
  name,
  props: radioProps,
  emits: radioEmits,
  formAssociated: true,
  setup(props, { emit: e }) {
    const emit = useSetupEvent<typeof e>();
    const [editComputed] = useSetupEdit();
    const radioContext = RadioCollector.child();
    const ns = useNamespace(name, { parent: radioContext?.parent });
    const mergedProps = virtualGetMerge(props, radioContext?.parent?.props);

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
        const { type } = radioContext?.parent?.props || {};
        const button = type === 'button',
          card = type === 'card';
        return {
          checked,
          button,
          card,
          start: button && (props.start || radioContext?.isStart),
          end: button && (props.end || radioContext?.isEnd),
        };
      },
      ns,
    );

    return () => {
      const { labelPosition, noIndicator } = mergedProps;
      const labelPart = (
        <span part={ns.p('label')} class={ns.e('label')}>
          <slot>{props.label}</slot>
        </span>
      );
      return (
        <label part={ns.p('root')} class={stateClass.value}>
          {labelPosition === 'start' && labelPart}
          <input
            type={name}
            checked={checked.value}
            value={props.value}
            disabled={editComputed.disabled}
            onChange={handler.onChange}
            hidden
          />
          {!noIndicator && <span class={ns.e('indicator')} part={ns.p('indicator')}></span>}
          {labelPosition === 'end' && labelPart}
        </label>
      );
    };
  },
});

export type tRadio = typeof Radio;
export type iRadio = InstanceType<typeof Radio>;

export const defineRadio = createDefineElement(name, Radio);
