import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { selectOptgroupProps } from './type';
import { useNamespace } from 'hooks';
import { useSetupEdit } from '@lun/core';
import { SelectCollector, SelectOptgroupContext } from '.';

const name = 'select-optgroup';
export const SelectOptgroup = defineSSRCustomElement({
  name,
  props: selectOptgroupProps,
  setup(props) {
    const selectContext = SelectCollector.child(false);
    const ns = useNamespace(name, { parent: selectContext?.parent });
    SelectOptgroupContext.provide();
    const [editComputed] = useSetupEdit();

    return () => (
      <div part="root" class={ns.s(editComputed)}>
        <div class={ns.e('label')} part="label">
          {props.label}
        </div>
        <div class={ns.e('children')} part="children">
          <slot></slot>
        </div>
      </div>
    );
  },
});

export type tSelectOptgroup = typeof SelectOptgroup;

export const defineSelectOptgroup = createDefineElement(name, SelectOptgroup);
