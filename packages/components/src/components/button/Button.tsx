import { defineSSRCustomElement } from 'custom';
import { useSetupEdit } from '@lun/core';
import { defineSpin } from '../spin';
import { createDefineElement, renderElement } from 'utils';
import { buttonProps } from './type';
import { useNamespace } from 'hooks';

const name = 'button';
export const Button = defineSSRCustomElement({
  name,
  props: buttonProps,
  setup(props) {
    const ns = useNamespace(name);
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

    return () => {
      const { disabled, loading } = editComputed.value;
      const finalDisabled = !!(disabled || loading);
      const spinProps = { size: props.size, ...props.spinProps };
      const loadingPart = loading && props.showLoading ? renderElement('spin', spinProps) : <slot name="icon"></slot>;
      return (
        <button
          class={[
            ns.b(),
            props.variant && ns.m(`variant-${props.variant}`),
            ns.bp(props.size),
            ns.is('disabled', finalDisabled),
          ]}
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

export const defineButton = createDefineElement(name, Button, {
  spin: defineSpin,
});
