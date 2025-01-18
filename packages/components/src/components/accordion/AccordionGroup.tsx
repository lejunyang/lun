import { defineCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { accordionGroupEmits, accordionGroupProps } from './type';
import { useValueSet, useCEExpose, useCEStates, useNamespace, updateRawSetModel } from 'hooks';
import { getCompParts } from 'common';
import { useExpandMethods, UseExpandMethods, useSetupEdit } from '@lun-web/core';
import { AccordionCollector } from './collector';
import { computed, ref, watchEffect } from 'vue';

const name = 'accordion-group';
const parts = ['root'] as const;
const compParts = getCompParts(name, parts);
export const AccordionGroup = defineCustomElement({
  name,
  props: accordionGroupProps,
  emits: accordionGroupEmits,
  setup(props, { emit }) {
    useNamespace(name);
    useSetupEdit();
    const openModel = ref<{ value: any; raw?: any }>({ value: undefined, raw: undefined });
    const multiple = () => props.allowMultiple;
    watchEffect(() => {
      const { open, defaultOpen } = props;
      if (open) updateRawSetModel(openModel, open, multiple);
      else if (defaultOpen) updateRawSetModel(openModel, defaultOpen, multiple);
    });
    const openSet = useValueSet(openModel, multiple);
    const childrenNames = computed(() => new Set(context.value.map((c, i) => c.props.name || i)));
    const [, methods] = useExpandMethods({
      current: openSet,
      multiple,
      allValues: childrenNames,
      onChange(value) {
        openModel.value = value;
        emit('update', value as any);
      },
    });
    const context = AccordionCollector.parent({
      extraProvide: methods,
    });

    useCEExpose(methods);
    const [stateClass] = useCEStates(() => null);

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
export type AccordionGroupExpose = UseExpandMethods;
export type iAccordionGroup = InstanceType<tAccordionGroup> & AccordionGroupExpose;

export const defineAccordionGroup = createDefineElement(name, AccordionGroup, {}, parts);
