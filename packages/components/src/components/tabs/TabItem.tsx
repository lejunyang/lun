import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { tabItemEmits, tabItemProps } from './type';
import { getCompParts, getTransitionProps } from 'common';
import { TabsCollector } from './collector';
import { useNamespace } from 'hooks';
import { Transition } from 'vue';

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
      const show = context?.isActive(slot as string, context?.index); // NEED whole rerender when show changes to get new transition name
      // Before, this was in v-show attr. that div would be Transition's default slot after transpiled( {{ default: () => <div></div> }}). When show changed, only that div rerendered
      return (
        <Transition
          {...getTransitionProps(props, 'panel', context?.getTransitionName?.())}
          onAfterEnter={context?.transitionEnd}
        >
          <div class={ns.t} v-show={show} part={compParts[0]}>
            <slot></slot>
          </div>
        </Transition>
      );
    };
  },
});

export type tTabItem = typeof TabItem;
export type iTabItem = InstanceType<tTabItem>;

export const defineTabItem = createDefineElement(name, TabItem, {}, parts);
