import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { accordionGroupEmits, accordionGroupProps } from './type';
import { useCEExpose, useCEStates, useNamespace } from 'hooks';
import { getCompParts } from 'common';
import { defineIcon } from '../icon';
import { useGroupOpenMethods, useSetupEdit } from '@lun/core';
import { AccordionCollector } from './collector';
import { computed, ref, watchEffect } from 'vue';
import { toArrayIfNotNil } from '@lun/utils';

const name = 'accordion-group';
const parts = ['root'] as const;
const compParts = getCompParts(name, parts);
export const AccordionGroup = defineSSRCustomElement({
  name,
  props: accordionGroupProps,
  emits: accordionGroupEmits,
  setup(props, { emit }) {
    const ns = useNamespace(name);
    useSetupEdit();
    const openModel = ref();
    watchEffect(() => {
      const { open, defaultOpen, allowMultiple } = props;
      if (open) openModel.value = allowMultiple ? toArrayIfNotNil(open) : open;
      else if (defaultOpen) openModel.value = allowMultiple ? toArrayIfNotNil(defaultOpen) : defaultOpen;
    });
    const openSet = computed(() => new Set<any>(toArrayIfNotNil(openModel.value)));
    const childrenNames = computed(() => new Set(context.value.map((c, i) => c.props.name || i)));
    const methods = useGroupOpenMethods({
      valueSet: openSet,
      multiple: () => props.allowMultiple,
      allValues: childrenNames,
      onChange(value) {
        openModel.value = value;
        emit('update', value);
      },
    });
    const context = AccordionCollector.parent({
      extraProvide: methods,
    });

    useCEExpose(methods);
    const [stateClass] = useCEStates(() => null, ns);

    return () => {
      return (
        <div class={stateClass.value} part={compParts[0]}>
          <slot></slot>
        </div>
      );
    };
  },
});

export type tAccordionGroup = typeof AccordionGroup;
export type AccordionGroupExpose = ReturnType<typeof useGroupOpenMethods>;
export type iAccordionGroup = InstanceType<tAccordionGroup> & AccordionGroupExpose;

export const defineAccordionGroup = createDefineElement(name, AccordionGroup, {}, parts, {
  icon: defineIcon,
});
