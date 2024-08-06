import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { tabItemEmits, tabItemProps } from './type';
import { getCompParts } from 'common';
import { TabsCollector } from './collector';
import { useNamespace } from 'hooks';

const name = 'tab-item';
const parts = ['root'] as const;
const compParts = getCompParts(name, parts);
export const TabItem = defineSSRCustomElement({
  name,
  props: tabItemProps,
  emits: tabItemEmits,
  setup(props) {
    const ns = useNamespace(name);
    const context = TabsCollector.child();
    return () => {
      const { slot } = props;
      return (
        <div class={ns.t} v-show={context?.isActive(slot as string, context?.index)} part={compParts[0]}>
          <slot></slot>
        </div>
      );
    };
  },
});

export type tTabItem = typeof TabItem;
export type iTabItem = InstanceType<tTabItem>;

export const defineTabItem = createDefineElement(name, TabItem, {}, parts);
