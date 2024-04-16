import { defineSSRCustomElement } from 'custom';
import { useSetupEdit } from '@lun/core';
import { createDefineElement } from 'utils';
import { useCEStates, useNamespace, useOptions, useSetupContextEvent, useValueModel } from 'hooks';
import { RadioCollector } from './collector';
import { radioEmits, radioGroupProps } from './type';

const name = 'radio-group';
export const RadioGroup = defineSSRCustomElement({
  name,
  props: radioGroupProps,
  emits: radioEmits,
  formAssociated: true,
  setup(props) {
    const ns = useNamespace(name);
    const valueModel = useValueModel(props);
    useSetupContextEvent({
      update(value) {
        valueModel.value = value;
      },
    });
    const [editComputed] = useSetupEdit();
    RadioCollector.parent({ extraProvide: { valueModel } });

    const { render } = useOptions(props, 'radio');

    const [stateClass] = useCEStates(() => ({}), ns, editComputed);

    // TODO arrow move to check prev/next active radio
    return () => (
      <div class={[stateClass.value, ns.m(props.type)]} part={ns.p('root')}>
        {render.value}
        <slot></slot>
      </div>
    );
  },
});

export type tRadioGroup = typeof RadioGroup;
export type iRadioGroup = InstanceType<tRadioGroup>;

export const defineRadioGroup = createDefineElement(name, RadioGroup);
