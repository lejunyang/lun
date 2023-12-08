import { defineSSRCustomFormElement } from 'custom';
import { computed } from 'vue';
import { useSetupEdit } from '@lun/core';
import { createDefineElement } from 'utils';
import { useNamespace, useSetupContextEvent, useVModelCompatible } from 'hooks';
import { RadioCollector } from '.';
import { radioProps } from './type';

const name = 'radio';
export const Radio = defineSSRCustomFormElement({
  name,
  props: radioProps,
  emits: ['update'],
  setup(props, { emit }) {
    const ns = useNamespace(name);
    useSetupContextEvent();
    const [editComputed] = useSetupEdit();
    const [updateVModel] = useVModelCompatible();
    const radioContext = RadioCollector.child();
    const checked = computed(() => {
      if (!radioContext?.parent) return props.checked;
      const { value } = radioContext.valueModel;
      return value === props.value;
    });
    const handler = {
      onChange() {
        emit('update', props.value);
        updateVModel(props.value);
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

export const defineRadio = createDefineElement(name, Radio);
