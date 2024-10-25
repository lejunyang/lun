import { defineSSRCustomElement } from 'custom';
import { computed, getCurrentInstance } from 'vue';
import { refLikesToGetters, useSetupEdit, useSetupEvent } from '@lun/core';
import { createDefineElement, renderElement } from 'utils';
import { useCEStates, useExpose, useNamespace } from 'hooks';
import { selectOptionProps } from './type';
import { SelectOptgroupContext } from '.';
import { defineIcon } from '../icon/Icon';
import { renderCustom } from '../custom-renderer/CustomRenderer';
import { SelectCollector } from './collector';
import { getCompParts } from 'common';

const name = 'select-option';
const parts = ['root', 'label'] as const;
const compParts = getCompParts(name, parts);
export const SelectOption = defineSSRCustomElement({
  name,
  props: selectOptionProps,
  setup(props) {
    const selectContext = SelectCollector.child(!props.excludeFromSelect, props.selectContext);
    const optgroup = SelectOptgroupContext.inject();
    if (!selectContext) {
      throw new Error(name + ' must be used under select');
    }
    const vm = getCurrentInstance()!;
    const ns = useNamespace(name, { parent: optgroup || selectContext.parent });

    useSetupEvent();
    const [editComputed] = useSetupEdit();

    const selected = computed(() => {
      return selectContext.isSelected(props.value);
    });
    const hidden = computed(() => {
      return selectContext.isHidden(props);
    });
    const active = computed(() => selectContext.isActive(vm));

    const disabled = () => editComputed.disabled;
    useExpose(refLikesToGetters({ hidden, selected, disabled })); // expose it to Select
    const [stateClass] = useCEStates(() => ({ selected, active, underGroup: optgroup }), ns);

    const handlers = {
      onClick() {
        if (disabled()) return;
        const { clickOption, multiple } = selectContext.parent!.props;
        selectContext[clickOption === 'select' && !multiple ? 'select' : 'toggle'](props.value);
      },
      onPointerenter() {
        if (disabled()) return;
        selectContext.activate(vm);
      },
      onPointerleave() {
        if (disabled()) return;
        selectContext.deactivate();
      },
    };
    return () => {
      const { content, label } = props;
      return (
        <label part={compParts[0]} class={stateClass.value} hidden={hidden.value} {...handlers}>
          <slot name="start"></slot>
          <span class={ns.e('label')} part={compParts[1]}>
            {content ? renderCustom(content) : <slot>{label}</slot>}
          </span>
          {selected.value && <slot name="end">{renderElement('icon', { name: 'check' })}</slot>}
        </label>
      );
    };
  },
});

export type tSelectOption = typeof SelectOption;
export type iSelectOption = InstanceType<typeof SelectOption>;

export const defineSelectOption = createDefineElement(name, SelectOption, {}, parts, {
  icon: defineIcon,
});
