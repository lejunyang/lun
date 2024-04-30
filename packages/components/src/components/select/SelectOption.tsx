import { defineSSRCustomElement } from 'custom';
import { computed, getCurrentInstance } from 'vue';
import { refLikesToGetters, useSetupEdit, useSetupEvent } from '@lun/core';
import { createDefineElement, renderElement } from 'utils';
import { useCEStates, useNamespace } from 'hooks';
import { selectOptionProps } from './type';
import { SelectOptgroupContext } from '.';
import { defineIcon } from '../icon/Icon';
import { VCustomRenderer } from '../custom-renderer/CustomRenderer';
import { SelectCollector } from './collector';

const name = 'select-option';
export const SelectOption = defineSSRCustomElement({
  name,
  props: selectOptionProps,
  setup(props, { expose }) {
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

    const disabled = () => editComputed.value.disabled;
    expose(refLikesToGetters({ hidden, selected, disabled })); // expose it to Select
    const [stateClass] = useCEStates(() => ({ selected, active, 'under-group': optgroup }), ns, editComputed);

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
      const { content, contentType: type, contentPreferHtml: preferHtml } = props;
      return (
        <label part="root" class={stateClass.value} hidden={hidden.value} {...handlers}>
          <slot name="start"></slot>
          <span class={ns.e('label')} part="label">
            {content ? (
              <VCustomRenderer content={content} type={type} preferHtml={preferHtml} />
            ) : (
              <slot>{props.label}</slot>
            )}
          </span>
          {selected.value && <slot name="end">{renderElement('icon', { name: 'check' })}</slot>}
        </label>
      );
    };
  },
});

export type tSelectOption = typeof SelectOption;
export type iSelectOption = InstanceType<typeof SelectOption>;

export const defineSelectOption = createDefineElement(name, SelectOption, {
  icon: defineIcon,
});
