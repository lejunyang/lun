import type { PropType } from 'vue';
import { h } from 'vue';
import { defineSSRCustomElement } from 'custom';
import { editStateProps } from 'common';
import { Responsive, useComputedBreakpoints, useSetupEdit } from '@lun/core';
import { GlobalStaticConfig } from 'config';
import { defineSpin } from '../spin';
import { setDefaultsForPropOptions } from 'utils';

export const Button = defineSSRCustomElement({
  name: GlobalStaticConfig.nameMap.button,
  props: {
    ...editStateProps,
    label: { type: String },
    asyncHandler: { type: Function as PropType<(e: MouseEvent) => void> },
    spinProps: { type: Object },
    ...setDefaultsForPropOptions(
      {
        size: { type: [String, Object] as PropType<Responsive<'1' | '2' | '3'>> },
        showLoading: { type: Boolean },
        iconPosition: { type: String as PropType<LogicalPosition> },
      },
      GlobalStaticConfig.defaultProps.button
    ),
  },
  styles: GlobalStaticConfig.computedStyles.button,
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
          {props.iconPosition === 'start' && props.showLoading && loading ? (
            h(actualSpinName, spinProps)
          ) : (
            <slot name="icon"></slot>
          )}
          <slot>{props.label}</slot>
          {props.iconPosition === 'end' && props.showLoading && loading ? (
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
