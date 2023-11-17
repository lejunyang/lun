import { defineSSRCustomFormElement } from 'custom';
import { computed } from 'vue';
import { useSetupEdit } from '@lun/core';
import { createDefineElement, warn } from 'utils';
import { useCheckedModel, useNamespace, useSetupContextEvent, useVModelCompatible } from 'hooks';
import { CheckboxCollector } from '.';
import { CheckboxUpdateDetail, checkboxProps } from './type';

const name = 'checkbox';
export const Checkbox = defineSSRCustomFormElement({
  name,
  props: checkboxProps,
  emits: {
    update: (_detail: CheckboxUpdateDetail) => null,
  },
  setup(props, { emit }) {
    const ns = useNamespace(name);
    useSetupContextEvent();
    const [editComputed] = useSetupEdit();
    const checkboxContext = CheckboxCollector.child();
    // if it's under CheckboxGroup, it will not be considered as a model
    const checkedModal = checkboxContext
      ? undefined
      : useCheckedModel(props, {
          shouldEmit: false,
        });
    const [updateVModel] = useVModelCompatible();
    if (__DEV__) {
      if (checkboxContext && props.value == null)
        warn(
          `Please assign the 'value' prop with a defined value to the checkbox that it's under a checkbox-group, or it will be ignored`
        );
      if (props.checkForAll && !checkboxContext)
        warn(`checkbox with 'checkForAll' only works under checkbox-group, unless you want to manipulate it manually`);
    }

    const intermediate = computed(() => {
      if (!checkboxContext || props.excludeFromGroup) return props.intermediate;
      return props.checkForAll && checkboxContext.radioState.value.intermediate;
    });
    const checked = computed(() => {
      if (!checkboxContext || props.excludeFromGroup) return checkedModal?.value ?? props.checked;
      const { radioState } = checkboxContext;
      const { allChecked, isChecked } = radioState.value;
      return allChecked || (!props.checkForAll && isChecked(props.value));
    });
    const handler = {
      onChange(e: Event) {
        const { checked } = e.target as HTMLInputElement;
        // if it's under CheckboxGroup, use value prop as checked value
        const value = checkboxContext ? props.value : checked ? props.trueValue : props.falseValue;
        if (checkedModal) checkedModal.value = checked;
        emit('update', {
          value,
          isCheckForAll: props.checkForAll,
          checked,
          onlyFor: props.onlyFor,
          excludeFromGroup: props.excludeFromGroup,
        });
        updateVModel(value);
      },
    };
    return () => {
      const labelPart = (
        <span part="label">
          <slot>{props.label}</slot>
        </span>
      );
      return (
        <>
          <label part="root">
            {props.labelPosition === 'start' && labelPart}
            <span part="wrapper">
              <input
                part="input"
                type={name}
                checked={checked.value}
                indeterminate={intermediate.value}
                value={props.value}
                readonly={editComputed.value.readonly}
                disabled={editComputed.value.disabled}
                onChange={handler.onChange}
              />
            </span>
            {props.labelPosition === 'end' && labelPart}
          </label>
        </>
      );
    };
  },
});

declare module 'vue' {
  export interface GlobalComponents {
    LCheckbox: typeof Checkbox;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-checkbox': typeof Checkbox;
  }
}

export const defineCheckbox = createDefineElement(name, Checkbox);
