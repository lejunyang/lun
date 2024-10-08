import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { accordionEmits, accordionProps } from './type';
import { useCEStates, useNamespace, useOpenModel, useSlot } from 'hooks';
import { getCompParts, getTransitionProps } from 'common';
import { defineIcon } from '../icon';
import { Transition } from 'vue';
import { useSetupEdit } from '@lun/core';
import { isString } from '@lun/utils';

const name = 'accordion';
const parts = ['root', 'header', 'content', 'indicator'] as const;
const compParts = getCompParts(name, parts);
export const Accordion = defineSSRCustomElement({
  name,
  props: accordionProps,
  emits: accordionEmits,
  setup(props) {
    const ns = useNamespace(name);
    const openModel = useOpenModel(props);
    useSetupEdit();

    const [renderHeader] = useSlot('header', () => props.header);
    const [renderContent] = useSlot('', () => props.content);

    const handleToggle = () => {
      openModel.value = !openModel.value;
    };
    const resolveIcon = (val?: string | { open?: string; close?: string }, defaultV?: string) => {
      if (isString(val)) return val;
      else return openModel.value ? val?.open ?? defaultV : val?.close ?? defaultV;
    };

    const [stateClass] = useCEStates(() => ({ open: openModel }), ns);
    return () => {
      const { iconPosition = 'end', iconName, iconLibrary } = props;
      const icon = renderElement('icon', {
        name: resolveIcon(iconName, 'right'),
        library: resolveIcon(iconLibrary),
        part: compParts[3],
        class: [ns.e('indicator'), ns.is(iconPosition)],
      });
      return (
        <div class={stateClass.value} part={compParts[0]}>
          <div class={ns.e('header')} part={compParts[1]} onClick={handleToggle}>
            {iconPosition === 'start' && icon}
            {renderHeader()}
            {iconPosition === 'end' && icon}
          </div>
          <Transition {...getTransitionProps(props, 'content', 'height')}>
            <div class={ns.e('content')} part={compParts[2]} v-content={openModel.value}>
              {renderContent()}
            </div>
          </Transition>
        </div>
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
