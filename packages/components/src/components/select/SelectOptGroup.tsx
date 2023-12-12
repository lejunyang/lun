import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { selectOptgroupProps } from './type';
import { useNamespace } from 'hooks';
import { useSetupEdit } from '@lun/core';

const name = 'select-optgroup';
export const SelectOptGroup = defineSSRCustomElement({
  name,
  props: selectOptgroupProps,
  setup(props) {
    const ns = useNamespace(name);
    const [editComputed] = useSetupEdit(); // TODO disabled class

    return () => (
      <div part="root" class={ns.b()}>
        <div class={ns.e('label')}>{props.label}</div>
        <div class={ns.e('content')}>
          <slot></slot>
        </div>
      </div>
    );
  },
});

export const defineSelectOptGroup = createDefineElement(name, SelectOptGroup);
