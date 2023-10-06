import { defineSSRCustomFormElement } from 'custom';
import { GlobalStaticConfig } from 'config';
import { PropType, computed } from 'vue';
import { useSetupEdit } from '@lun/core';
import { setDefaultsForPropOptions, warn } from 'utils';
import { editStateProps } from 'common';
import { useSetupContextEvent, useVModelCompatible } from 'hooks';
import { CheckboxCollector } from '.';

export type CheckboxUpdateDetail = {
  value: any;
  isCheckForAll: boolean;
  checked: boolean;
  onlyFor?: string;
  excludeFromGroup?: boolean;
};

export const Checkbox = defineSSRCustomFormElement({
  name: GlobalStaticConfig.nameMap.checkbox,
  props: {
    ...editStateProps,
    ...setDefaultsForPropOptions(
      {
        value: {},
        label: { type: String },
        labelPosition: { type: String as PropType<'left' | 'right'> },
        checked: { type: Boolean },
        intermediate: { type: Boolean },
        checkForAll: { type: Boolean },
        onlyFor: { type: String },
        excludeFromGroup: { type: Boolean },
      },
      GlobalStaticConfig.defaultProps.checkbox
    ),
  },
  styles: GlobalStaticConfig.computedStyles.checkbox,
  emits: {
    update: (_detail: CheckboxUpdateDetail) => null,
  },
  setup(props, { emit }) {
    useSetupContextEvent();
    const [editComputed] = useSetupEdit();
    const { updateVModel } = useVModelCompatible();
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
    return () => (
      <>
        <label part="label">
          {props.labelPosition === 'left' && (
            <span part="label">
              <slot>{props.label}</slot>
            </span>
          )}
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
          {props.labelPosition === 'right' && (
            <span part="label">
              <slot>{props.label}</slot>
            </span>
          )}
        </label>
      </>
    );
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

export function defineCheckbox(name?: string) {
  name ||= GlobalStaticConfig.nameMap.checkbox;
  if (!customElements.get(name)) {
    GlobalStaticConfig.actualNameMap['checkbox'].add(name);
    customElements.define(name, Checkbox);
  }
}
