import { defineSSRCustomElement } from 'custom';
import { useComputedBreakpoints, useSetupEdit } from '@lun/core';
import { GlobalStaticConfig } from 'config';
import { defineSpin } from '../spin';
import { createDefineElement, getCommonElementOptions, renderElement, setDefaultsForPropOptions } from 'utils';
import { buttonProps } from './type';

export const Button = defineSSRCustomElement({
  ...getCommonElementOptions('button'),
  props: setDefaultsForPropOptions(buttonProps, GlobalStaticConfig.defaultProps.button),
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

    return () => {
      const { disabled, loading } = editComputed.value;
      const finalDisabled = !!(disabled || loading);
      const spinProps = { size: props.size, ...props.spinProps };
      const loadingPart = loading && props.showLoading ? renderElement('spin', spinProps) : <slot name="icon"></slot>;
      return (
        <button
          class={[buttonSizeClass.value]}
          aria-disabled={finalDisabled}
          disabled={finalDisabled}
          onClick={handler.onClick}
          part="button"
        >
          {props.iconPosition === 'start' && loadingPart}
          <slot>{props.label}</slot>
          {props.iconPosition === 'end' && loadingPart}
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

export const defineButton = (buttonName?: string, spinName?: string) => {
  defineSpin(spinName);
  createDefineElement('button', Button)(buttonName);
};
