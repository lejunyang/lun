import { defineCustomElement } from 'custom';
import { computed, ref } from 'vue';
import { refLikesToGetters, useSetupEdit, useSetupEvent } from '@lun-web/core';
import { createDefineElement, renderElement, warn } from 'utils';
import { interceptCEMethods, useCEStates, useCheckedModel, useExpose, useNamespace } from 'hooks';
import { CheckboxCollector } from './collector';
import { checkboxEmits, checkboxProps } from './type';
import { defineIcon } from '../icon/Icon';
import { isEnterDown } from '@lun-web/utils';
import { ElementWithExpose, getCompParts } from 'common';

const name = 'checkbox';
const parts = ['root', 'indicator', 'input', 'label'] as const;
const compParts = getCompParts(name, parts);
export const Checkbox = defineCustomElement({
  name,
  props: checkboxProps,
  emits: checkboxEmits,
  formAssociated: true,
  setup(props, { emit: e }) {
    const checkboxContext = CheckboxCollector.child();
    const ns = useNamespace(name, { parent: checkboxContext?.parent });
    const emit = useSetupEvent<typeof e>();
    const [editComputed] = useSetupEdit();
    // if it's under CheckboxGroup, it will not be considered as a model
    const checkedModel = checkboxContext
      ? undefined
      : useCheckedModel(props, {
          shouldEmit: false, // do not use auto emit of useCheckedModel, as we need to customize the emit args
        });
    if (__DEV__) {
      if (checkboxContext && props.value == null)
        warn(
          `Please assign the 'value' prop with a defined value to the checkbox that it's under a checkbox-group, or it will be ignored`,
        );
      if (props.checkForAll && !checkboxContext)
        warn(`checkbox with 'checkForAll' only works under checkbox-group, unless you want to manipulate it manually`);
    }
    const inputEl = ref<HTMLInputElement>();

    const intermediate = computed(() => {
      if (!checkboxContext || props.excludeFromGroup) return props.intermediate && !props.checked;
      return props.checkForAll && checkboxContext[0].intermediate;
    });
    const checked = computed(() => {
      if (!checkboxContext || props.excludeFromGroup) return checkedModel?.value ?? props.checked;
      return (
        (checkboxContext[0].allChecked && !editComputed.disabled) ||
        (!props.checkForAll && checkboxContext[1].isChecked(props.value))
      );
    });

    const updateChecked = (checked: boolean) => {
      // if it's under CheckboxGroup, use value prop as checked value
      const value = checkboxContext ? props.value : checked ? props.trueValue : props.falseValue;
      if (checkedModel) checkedModel.value = checked;
      emit('update', {
        value,
        isCheckForAll: props.checkForAll!,
        checked,
        onlyFor: props.onlyFor,
        excludeFromGroup: props.excludeFromGroup,
      });
    };
    const handlers = {
      onChange(e: Event) {
        const { checked } = e.target as HTMLInputElement;
        updateChecked(checked);
      },
      onKeydown(e: KeyboardEvent) {
        if (isEnterDown(e) && editComputed.editable) {
          updateChecked(!checked.value);
        }
      },
    };

    const type = computed(() => props.type || checkboxContext?.parent!.props.type);

    const [stateClass] = useCEStates(() => ({
      card: type.value === 'card',
      checked,
      intermediate,
      on: [checked, intermediate],
    }));

    interceptCEMethods(inputEl);
    useExpose(refLikesToGetters({ disabled: () => editComputed.disabled }));
    return () => {
      const isChecked = checked.value,
        isIntermediate = intermediate.value;
      const { editable } = editComputed;
      const labelPart = (
        <span part={compParts[3]} class={ns.e('label')}>
          <slot>{props.label}</slot>
        </span>
      );
      return (
        <>
          <label part={compParts[0]} class={stateClass.value}>
            {props.labelPosition === 'start' && labelPart}
            <span
              part={compParts[1]}
              class={ns.e('indicator')}
              tabindex={editable ? 0 : undefined}
              onKeydown={handlers.onKeydown}
            >
              <slot name="checked" v-content={isChecked}>
                {renderElement('icon', { name: 'check', style: 'width: 100%; height: 100%' })}
              </slot>
              <slot name="intermediate" v-content={isIntermediate}>
                {renderElement('icon', { name: 'dash', style: 'width: 100%; height: 100%' })}
              </slot>
              <input
                ref={inputEl}
                class={[ns.e('input')]}
                part={compParts[2]}
                type={name}
                checked={isChecked}
                indeterminate={isIntermediate}
                value={props.value}
                // readonly={readonly} // readonly is not supported by checkbox
                disabled={!editable}
                onChange={handlers.onChange}
                hidden
              />
            </span>
            {props.labelPosition === 'end' && labelPart}
          </label>
        </>
      );
    };
  },
});

export type CheckboxExpose = {};
export type tCheckbox = ElementWithExpose<typeof Checkbox, CheckboxExpose>;
export type iCheckbox = InstanceType<tCheckbox>;

export const defineCheckbox = createDefineElement(
  name,
  Checkbox,
  {
    labelPosition: 'end',
  },
  parts,
  [defineIcon],
);
