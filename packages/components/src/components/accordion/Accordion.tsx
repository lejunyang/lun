import { defineSSRCustomElement } from 'custom';
import { createDefineElement, setHeightVar } from 'utils';
import { accordionEmits, accordionProps } from './type';
import { useNamespace, useOpenModel, useSlot } from 'hooks';
import { getCompParts, getTransitionProps } from 'common';
import { defineIcon } from '../icon';
import { Transition } from 'vue';

const name = 'accordion';
const parts = ['root', 'header', 'content'] as const;
const compParts = getCompParts(name, parts);
export const Accordion = defineSSRCustomElement({
  name,
  props: accordionProps,
  emits: accordionEmits,
  setup(props) {
    const ns = useNamespace(name);
    const openModel = useOpenModel(props);

    const [renderHeader] = useSlot('header', () => props.header);
    const [renderContent] = useSlot('', () => props.content);

    const handleToggle = () => {
      openModel.value = !openModel.value;
    };
    return () => {
      return (
        <details class={ns.t} part={compParts[0]} open={openModel.value} onToggle={handleToggle}>
          <summary class={ns.e('header')} part={compParts[1]}>
            {renderHeader()}
          </summary>
          <Transition {...getTransitionProps(props, 'content')} onEnter={setHeightVar}>
            <div class={ns.e('content')} part={compParts[2]} v-show={openModel.value}>
              {renderContent()}
            </div>
          </Transition>
        </details>
      );
    };
  },
});

export type tAccordion = typeof Accordion;
export type AccordionExpose = {};
export type iAccordion = InstanceType<tAccordion> & AccordionExpose;

export const defineAccordion = createDefineElement(name, Accordion, {}, parts, {
  icon: defineIcon,
});
