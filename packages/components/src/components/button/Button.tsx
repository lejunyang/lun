import type { PropType } from 'vue';
import { h } from 'vue';
import { defineCustomElement } from 'custom';
import { editStateProps } from 'common';
import { Responsive, useComputedBreakpoints, useSetupEdit } from '@lun/core';
import { GlobalStaticConfig } from 'config';
import { defineSpin } from '../spin';

export const Button = defineCustomElement({
  name: GlobalStaticConfig.nameMap.button,
  props: {
    ...editStateProps,
    label: { type: String },
    size: { type: [String, Object] as PropType<Responsive<'1' | '2' | '3'>>, default: '1' },
    asyncHandler: { type: Function as PropType<(e: MouseEvent) => void> },
    showLoading: { type: Boolean, default: true },
    spinProps: { type: Object },
    iconPosition: { type: String as PropType<'left' | 'right'>, default: 'left' },
  },
  styles: GlobalStaticConfig.styles.button,
  setup(props) {
    const [editComputed, editState] = useSetupEdit();
    const handler = {
      async onClick(e: MouseEvent) {
        if (editComputed.value.disabled || editComputed.value.loading) return;
        if (props.asyncHandler instanceof Function) {
          editState.loading = true;
          Promise.resolve(props.asyncHandler(e)).finally(() => (editState.loading = false));
        }
      },
    };
    const buttonSizeClass = useComputedBreakpoints(() => props.size, 'l-button-size');
    const actualSpinName = GlobalStaticConfig.actualNameMap.spin.values().next().value;

    return () => {
      const { disabled, loading } = editComputed.value;
      const finalDisabled = !!(disabled || loading);
      const spinProps = { size: props.size, ...props.spinProps };
      return (
        <button
          class={[buttonSizeClass.value]}
          aria-disabled={finalDisabled}
          disabled={finalDisabled}
          onClick={handler.onClick}
          part="button"
        >
          {props.iconPosition === 'left' && props.showLoading && loading ? (
            h(actualSpinName, spinProps)
          ) : (
            <slot name="icon"></slot>
          )}
          <slot>{props.label}</slot>
          {props.iconPosition === 'right' && props.showLoading && loading ? (
            h(actualSpinName, spinProps)
          ) : (
            <slot name="icon"></slot>
          )}
        </button>
      );
    };
  },
});

declare module 'vue' {
  export interface GlobalComponents {
    LButton: typeof Button;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-button': typeof Button;
  }
}

export function defineButton(buttonName?: string, spinName?: string) {
  defineSpin(spinName);
  buttonName ||= GlobalStaticConfig.nameMap.button;
  if (!customElements.get(buttonName)) {
    GlobalStaticConfig.actualNameMap['button'].add(buttonName);
    customElements.define(buttonName, Button);
  }
}
