import { defineSSRCustomElement } from 'custom';
import { computed } from 'vue';
import { refLikesToGetters, useSetupEdit } from '@lun/core';
import { createDefineElement, renderElement, warn } from 'utils';
import { useCEStates, useCheckedModel, useNamespace, useSetupContextEvent } from 'hooks';
import { CheckboxCollector } from './collector';
import { checkboxEmits, checkboxProps } from './type';
import { defineIcon } from '../icon/Icon';
import { isEnterDown } from '@lun/utils';

const name = 'checkbox';
export const Checkbox = defineSSRCustomElement({
  name,
  props: checkboxProps,
  emits: checkboxEmits,
  formAssociated: true,
  setup(props, { emit, expose }) {
    const checkboxContext = CheckboxCollector.child();
    const ns = useNamespace(name, { parent: checkboxContext?.parent });
    useSetupContextEvent();
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

    const intermediate = computed(() => {
      if (!checkboxContext || props.excludeFromGroup) return props.intermediate && !props.checked;
      return props.checkForAll && checkboxContext.radioState.value.intermediate;
    });
    const checked = computed(() => {
      if (!checkboxContext || props.excludeFromGroup) return checkedModel?.value ?? props.checked;
      const { radioState } = checkboxContext;
      const { allChecked, isChecked } = radioState.value;
      return (allChecked && !editComputed.value.disabled) || (!props.checkForAll && isChecked(props.value));
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
        if (isEnterDown(e) && editComputed.value.editable) {
          updateChecked(!checked.value);
        }
      },
    };

    const [stateClass] = useCEStates(
      () => ({
        checked,
        intermediate,
        on: checked.value || intermediate.value,
      }),
      ns,
      editComputed,
    );

    expose(refLikesToGetters({ disabled: () => editComputed.value.disabled }));
    return () => {
      const isChecked = checked.value,
        isIntermediate = intermediate.value;
      const { editable } = editComputed.value;
      const labelPart = (
        <span part={ns.p('label')} class={ns.e('label')}>
          <slot>{props.label}</slot>
        </span>
      );
      return (
        <>
          <label part={ns.p('root')} class={stateClass.value}>
            {props.labelPosition === 'start' && labelPart}
            <span
              part={ns.p('indicator')}
              class={ns.e('indicator')}
              tabindex={editable ? 0 : undefined}
              onKeydown={handlers.onKeydown}
            >
              <slot name="checked" v-show={isChecked}>
                {renderElement('icon', { name: 'check', style: 'width: 100%; height: 100%' })}
              </slot>
              <slot name="intermediate" v-show={isIntermediate}>
                {renderElement('icon', { name: 'dash', style: 'width: 100%; height: 100%' })}
              </slot>
              <input
                class={[ns.e('input')]}
                part={ns.p('input')}
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

export type tCheckbox = typeof Checkbox;

export const defineCheckbox = createDefineElement(name, Checkbox, {
  icon: defineIcon,
});
