import { defineCustomElement } from 'custom';
import { computed, ref } from 'vue';
import { useSetupEdit, useSetupEvent } from '@lun-web/core';
import { createDefineElement } from 'utils';
import { interceptCEMethods, useCEStates, useNamespace } from 'hooks';
import { RadioCollector } from './collector';
import { radioEmits, radioProps } from './type';
import { virtualGetMerge } from '@lun-web/utils';
import { ElementWithExpose, getCompParts } from 'common';

const name = 'radio';
const parts = ['root', 'label', 'indicator'] as const;
const compParts = getCompParts(name, parts);
export const Radio = defineCustomElement({
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
    const inputEl = ref<HTMLInputElement>();

    const checked = computed(() => {
      if (!radioContext?.parent) return props.checked;
      const { value } = radioContext.valueModel;
      return value === props.value;
    });
    const handler = {
      onChange(e: Event) {
        if (!editComputed.editable) {
          (e.target as HTMLInputElement).checked = !!checked.value;
          return;
        }
        emit('update', props.value);
      },
    };

    const [stateClass] = useCEStates(() => {
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
    });
    interceptCEMethods(inputEl);

    return () => {
      const { labelPosition, noIndicator } = mergedProps;
      const labelPart = (
        <span part={compParts[1]} class={ns.e('label')}>
          <slot>{props.label}</slot>
        </span>
      );
      return (
        <label part={compParts[0]} class={stateClass.value}>
          {labelPosition === 'start' && labelPart}
          <input
            ref={inputEl}
            type={name}
            checked={checked.value}
            value={props.value}
            disabled={editComputed.disabled}
            readonly={!editComputed.editable}
            onChange={handler.onChange}
            hidden
          />
          {!noIndicator && <span class={ns.e('indicator')} part={compParts[2]}></span>}
          {labelPosition === 'end' && labelPart}
        </label>
      );
    };
  },
});

export type RadioExpose = {};
export type tRadio = ElementWithExpose<typeof Radio, RadioExpose>;
export type iRadio = InstanceType<typeof Radio>;

export const defineRadio = createDefineElement(
  name,
  Radio,
  {
    labelPosition: 'end',
  },
  parts,
);
