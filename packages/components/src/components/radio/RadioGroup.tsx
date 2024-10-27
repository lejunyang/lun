import { defineSSRCustomElement } from 'custom';
import { useSetupEdit, useSetupEvent } from '@lun-web/core';
import { createDefineElement } from 'utils';
import { useCEStates, useNamespace, useOptions, useValueModel } from 'hooks';
import { RadioCollector } from './collector';
import { radioEmits, radioGroupProps } from './type';
import { getCompParts } from 'common';

const name = 'radio-group';
const parts = ['root'] as const;
const compParts = getCompParts(name, parts);
export const RadioGroup = defineSSRCustomElement({
  name,
  props: radioGroupProps,
  emits: radioEmits,
  formAssociated: true,
  setup(props) {
    const ns = useNamespace(name);
    useSetupEvent({
      update(value) {
        valueModel.value = value;
      },
    });
    const valueModel = useValueModel(props);
    const [_editComputed] = useSetupEdit();
    RadioCollector.parent({ extraProvide: { valueModel } });

    const { render } = useOptions(props, 'radio');

    const [stateClass] = useCEStates(() => ({}), ns);

    // TODO arrow move to check prev/next active radio
    return () => (
      <div class={[stateClass.value, ns.m(props.type)]} part={compParts[0]}>
        {render.value}
        <slot></slot>
      </div>
    );
  },
});

export type tRadioGroup = typeof RadioGroup;
export type iRadioGroup = InstanceType<tRadioGroup>;

export const defineRadioGroup = createDefineElement(name, RadioGroup, {}, parts);
