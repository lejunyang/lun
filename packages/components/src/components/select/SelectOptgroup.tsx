import { defineCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { selectOptgroupProps } from './type';
import { useCEStates, useNamespace } from 'hooks';
import { useSetupEdit } from '@lun-web/core';
import { SelectOptgroupContext } from '.';
import { SelectCollector } from './collector';
import { ElementWithExpose, getCompParts } from 'common';

const name = 'select-optgroup';
const parts = ['root', 'label', 'children'] as const;
const compParts = getCompParts(name, parts);
export const SelectOptgroup = defineCustomElement({
  name,
  props: selectOptgroupProps,
  setup(props) {
    const selectContext = SelectCollector.child(false, props.selectContext);
    const ns = useNamespace(name, { parent: selectContext?.parent });
    SelectOptgroupContext.provide();
    const [_editComputed] = useSetupEdit();
    const [stateClass] = useCEStates(() => null);

    return () => (
      <div part={compParts[0]} class={stateClass.value}>
        <div class={ns.e('label')} part={compParts[1]}>
          <slot name="group-label">{props.label}</slot>
        </div>
        <div class={ns.e('children')} part={compParts[2]}>
          <slot></slot>
        </div>
      </div>
    );
  },
});

export type SelectOptGroupExpose = {};
export type tSelectOptgroup = ElementWithExpose<typeof SelectOptgroup, SelectOptGroupExpose>;
export type iSelectOptgroup = InstanceType<tSelectOptgroup>;

export const defineSelectOptgroup = createDefineElement(name, SelectOptgroup, {}, parts);
