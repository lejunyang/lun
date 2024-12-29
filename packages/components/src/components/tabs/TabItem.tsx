import { defineCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { tabItemEmits, tabItemProps } from './type';
import { getCompParts } from 'common';
import { TabsCollector } from './collector';
import { useNamespace, useTransition } from 'hooks';
import { Transition } from 'vue';

const name = 'tab-item';
const parts = ['root'] as const;
const compParts = getCompParts(name, parts);
export const TabItem = defineCustomElement({
  name,
  props: tabItemProps,
  emits: tabItemEmits,
  setup(props) {
    const ns = useNamespace(name);
    const context = TabsCollector.child();
    const getTransition = useTransition(props, name, 'panel', context?.getTransitionName);
    return () => {
      const { slot } = props;
      const show = context?.isActive(slot as string, context?.index); // NEED whole rerender when show changes to get new transition name
      // Before, this was in v-content attr. that div would be Transition's default slot after transpiled( {{ default: () => <div></div> }}). When show changed, only that div rerendered
      return (
        <Transition {...getTransition()} onAfterEnter={context?.transitionEnd}>
          <div class={[ns.t, ns.is('hidden', !show)]} v-content={show} part={compParts[0]}>
            <slot></slot>
          </div>
        </Transition>
      );
    };
  },
});

export type tTabItem = typeof TabItem;
export type TabItemExpose = {};
export type iTabItem = InstanceType<tTabItem> & TabItemExpose;

export const defineTabItem = createDefineElement(name, TabItem, {}, parts);
