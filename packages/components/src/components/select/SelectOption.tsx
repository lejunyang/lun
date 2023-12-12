import { defineSSRCustomElement } from 'custom';
import { computed } from 'vue';
import { useSetupEdit } from '@lun/core';
import { createDefineElement } from 'utils';
import { useNamespace, useSetupContextEvent } from 'hooks';
import { selectOptionProps } from './type';
import { SelectCollector } from '.';

export const SelectOption = defineSSRCustomElement({
  name: 'select-option',
  props: selectOptionProps,
  setup(props) {
    const selectContext = SelectCollector.child();
    if (!selectContext) {
      throw new Error('select-option must be used under select');
    }
    const ns = useNamespace('select-option');

    useSetupContextEvent();
    const [editComputed] = useSetupEdit();

    const selected = computed(() => {
      return selectContext.isSelected(props.value);
    });
    const handler = {
      onClick() {
        if (editComputed.value.disabled) return;
        selectContext.toggle(props.value);
      },
    };
    return () => {
      return (
        <div
          part="root"
          class={[ns.is('selected', selected.value), ns.is('disabled', editComputed.value.disabled)]}
          onClick={handler.onClick}
        >
          <slot>{props.label}</slot>
        </div>
      );
    };
  },
});

export type tSelectOption = typeof SelectOption;

export const defineSelectOption = createDefineElement('select-option', SelectOption);
