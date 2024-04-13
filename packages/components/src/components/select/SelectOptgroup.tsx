import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { selectOptgroupProps } from './type';
import { useCEStates, useNamespace } from 'hooks';
import { useSetupEdit } from '@lun/core';
import { SelectOptgroupContext } from '.';
import { SelectCollector } from './collector';

const name = 'select-optgroup';
export const SelectOptgroup = defineSSRCustomElement({
  name,
  props: selectOptgroupProps,
  setup(props) {
    const selectContext = SelectCollector.child(false, props.selectContext);
    const ns = useNamespace(name, { parent: selectContext?.parent });
    SelectOptgroupContext.provide();
    const [editComputed] = useSetupEdit();
    const [stateClass] = useCEStates(() => null, ns, editComputed);

    return () => (
      <div part="root" class={stateClass.value}>
        <div class={ns.e('label')} part="label">
          <slot name="group-label">{props.label}</slot>
        </div>
        <div class={ns.e('children')} part="children">
          <slot></slot>
        </div>
      </div>
    );
  },
});

export type tSelectOptgroup = typeof SelectOptgroup;
export type iSelectOptgroup = InstanceType<tSelectOptgroup>;

export const defineSelectOptgroup = createDefineElement(name, SelectOptgroup);
