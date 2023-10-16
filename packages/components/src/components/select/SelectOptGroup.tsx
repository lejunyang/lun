import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { selectOptGroupProps } from './type';
import { useNamespace } from 'hooks';
import { useSetupEdit } from '@lun/core';

const name = 'select-optgroup';
export const SelectOptGroup = defineSSRCustomElement({
  name,
  props: selectOptGroupProps,
  setup(props) {
    const ns = useNamespace(name);
    const [editComputed] = useSetupEdit(); // TODO disabled class

    return () => (
      <div class={ns.b()}>
        <div class={ns.e('label')}>{props.label}</div>
        <div class={ns.e('content')}>
          <slot></slot>
        </div>
      </div>
    );
  },
});

declare module 'vue' {
  export interface GlobalComponents {
    LSelectOptGroup: typeof SelectOptGroup;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-select-optgroup': typeof SelectOptGroup;
  }
}

export const defineSelectOptGroup = createDefineElement(name, SelectOptGroup);
