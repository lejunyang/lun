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
  setup(props, { attrs }) {
    const ns = useNamespace(name);
    const context = TabsCollector.child();
    // TODO change collect? not using onMounted, start collecting when setup
    return () => {
      const { slot } = attrs;
      return (
        <div class={ns.t} v-show={context?.active.value === (slot ?? String(context?.index))} part={compParts[0]}>
          <slot></slot>
        </div>
      );
    };
  },
});

export type tTabItem = typeof TabItem;
export type iTabItem = InstanceType<tTabItem>;

export const defineTabItem = createDefineElement(name, TabItem, {}, parts);
