import { defineSSRCustomElement } from 'custom';
import { computed } from 'vue';
import { useSetupEdit } from '@lun/core';
import { createDefineElement, warn } from 'utils';
import { useSetupContextEvent, useVModelCompatible } from 'hooks';
import { SelectOptions, selectOptionProps } from './type';
import { SelectCollector } from '.';

export const SelectOption = defineSSRCustomElement({
  name: 'select-option',
  props: selectOptionProps,
  setup(props, { emit }) {
    useSetupContextEvent();
    const [editComputed] = useSetupEdit();
    const [updateVModel] = useVModelCompatible();
    const checkboxContext = SelectCollector.child();

    const selected = computed(() => {
      if (!checkboxContext) return props.selected;
      // const { radioState } = checkboxContext;
      // const { allChecked, parentValueSet } = radioState.value;
      // return allChecked || (!props.checkForAll && parentValueSet.has(props.value));
    });
    const handler = {
      onChange(e: Event) {
        const target = e.target as HTMLInputElement;
        // emit('update', {
        //   value: props.value,
        //   isCheckForAll: props.checkForAll,
        //   checked: target.checked,
        //   onlyFor: props.onlyFor,
        //   excludeFromGroup: props.excludeFromGroup,
        // });
        updateVModel(props.value);
      },
    };
    return () => {
      return props.label;
    };
  },
});

declare module 'vue' {
  export interface GlobalComponents {
    LSelectOption: typeof SelectOption;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-select-option': typeof SelectOption;
  }
}

export const defineSelectOption = createDefineElement('select-option', SelectOption);
