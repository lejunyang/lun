import { computed, onBeforeUnmount, onUnmounted } from 'vue';
import { useSetupEdit, useComputedBreakpoints, useMultipleInput } from '@lun/core';
import { defineSSRCustomFormElement } from 'custom';
import { createDefineElement } from 'utils';
import { useVModelCompatible, useValueModel } from 'hooks';
import { inputProps } from './type';

export const Input = defineSSRCustomFormElement({
  name: 'input',
  props: inputProps,
  inheritAttrs: false,
  emits: ['update', 'enterDown'],
  setup(props, { emit, attrs }) {
    const valueModel = useValueModel(props);
    const [updateVModel] = useVModelCompatible();
    const [editComputed] = useSetupEdit();

    const inputSizeClass = useComputedBreakpoints(() => props.size, 'l-input-size');

    const { inputHandlers, wrapperHandlers } = useMultipleInput(
      computed(() => ({
        ...props,
        value: valueModel.value,
        onChange: (val) => {
          updateVModel(val);
          emit('update', val);
        },
        onEnterDown(e) {
          emit('enterDown', e);
        },
      }))
    );
    // TODO mouse enter add class to show the clear button.  animation, hide suffix slot(render both, z-index?)
    return () => {
      const input = (
        <input
          {...attrs}
          type={props.type}
          id="input"
          part="input"
          class={['l-input']}
          value={!props.multiple ? valueModel.value : undefined}
          placeholder={props.placeholder}
          disabled={editComputed.value.disabled}
          readonly={editComputed.value.readonly}
          {...inputHandlers}
        />
      );
      return (
        <span
          part="root"
          class={[
            'l-input-root',
            'l-input-variant-surface',
            inputSizeClass.value,
            valueModel.value ? 'l-input-not-empty' : 'l-input-empty',
          ]}
        >
          <div class="l-input-slot l-input-addon-before" part="addon-before">
            <slot name="addon-before"></slot>
          </div>
          <label class="l-input-label" part="label">
            <div class="l-input-slot l-input-prefix" part="prefix">
              <slot name="prefix"></slot>
              {props.labelType === 'float' && (
                <div class="l-input-label l-input-float-label" part="float-label">
                  {props.label}
                  <div class="l-input-float-label-back">{props.label}</div>
                </div>
              )}
            </div>
            <span style="position: relative">
              {/* render when value is defined，in case it covers float label and placeholder */}
              {valueModel.value && (
                <div class="l-input l-input-custom-renderer">
                  <slot name="renderer"></slot>
                </div>
              )}
              {props.multiple ? (
                <span {...wrapperHandlers}>
                  {Array.isArray(valueModel.value) &&
                    valueModel.value.map((v, index) => (
                      <span tabindex={-1} data-tag-index={index} key={String(v) + index}>
                        {v}
                      </span>
                    ))}
                  {input}
                </span>
              ) : (
                input
              )}
            </span>
            <span class="l-input-back" />
            <span
              class={['l-input-slot l-input-suffix', props.showClearIcon && 'l-input-suffix-with-clear']}
              part="suffix"
            >
              {props.showClearIcon && <span class="l-input-clear-icon">x</span>}
              <slot name="suffix">
                <span class="l-input-clear-icon">x</span>
              </slot>
            </span>
            {props.maxLength! >= 0 && (
              <div class="l-input-length-info">
                {valueModel.value?.length || '0'}/{props.maxLength}
              </div>
            )}
          </label>
          <div class="l-input-slot l-input-addonAfter" part="addon-after">
            <slot name="addon-after"></slot>
          </div>
        </span>
      );
    };
  },
});

declare module 'vue' {
  export interface GlobalComponents {
    LInput: typeof Input;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-input': typeof Input;
  }
}

export const defineInput = createDefineElement('input', Input);
