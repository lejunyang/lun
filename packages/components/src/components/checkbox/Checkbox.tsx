import { defineSSRCustomFormElement } from 'custom';
import { GlobalStaticConfig } from 'config';
import { computed } from 'vue';
import { useSetupEdit } from '@lun/core';
import { createDefineComp, getCommonCompOptions, setDefaultsForPropOptions, warn } from 'utils';
import { useSetupContextEvent, useVModelCompatible } from 'hooks';
import { CheckboxCollector } from '.';
import { CheckboxUpdateDetail, checkboxProps } from './type';

export const Checkbox = defineSSRCustomFormElement({
  ...getCommonCompOptions('checkbox'),
  props: setDefaultsForPropOptions(checkboxProps, GlobalStaticConfig.defaultProps.checkbox),
  emits: {
    update: (_detail: CheckboxUpdateDetail) => null,
  },
  setup(props, { emit }) {
    useSetupContextEvent();
    const [editComputed] = useSetupEdit();
    const [updateVModel] = useVModelCompatible();
    const checkboxContext = CheckboxCollector.child();
    if (__DEV__) {
      if (checkboxContext && props.value == null)
        warn(
          `Please assign the 'value' prop with a defined value to the radio component that it's under the radio-group, or it will be ignored`
        );
      if (props.checkForAll && !checkboxContext)
        warn(`radio with 'checkForAll' only works under radio-group, unless you want to manipulate it manually`);
    }

    const intermediate = computed(() => {
      if (!checkboxContext || props.excludeFromGroup) return props.intermediate;
      return props.checkForAll && checkboxContext.radioState.value.intermediate;
    });
    const checked = computed(() => {
      if (!checkboxContext || props.excludeFromGroup) return props.checked;
      const { radioState } = checkboxContext;
      const { allChecked, parentValueSet } = radioState.value;
      return allChecked || (!props.checkForAll && parentValueSet.has(props.value));
    });
    const handler = {
      onChange(e: Event) {
        const target = e.target as HTMLInputElement;
        emit('update', {
          value: props.value,
          isCheckForAll: props.checkForAll,
          checked: target.checked,
          onlyFor: props.onlyFor,
          excludeFromGroup: props.excludeFromGroup,
        });
        updateVModel(props.value);
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
          <label part="wrapper">
            {props.labelPosition === 'start' && labelPart}
            <span>
              <input
                part="checkbox"
                type="checkbox"
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

export const defineCheckbox = createDefineComp('checkbox', Checkbox);
