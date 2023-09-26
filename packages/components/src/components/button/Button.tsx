import { PropType } from 'vue';
import { defineCustomElement } from 'custom';
import { editStateProps } from 'common';
import { Responsive, useComputedBreakpoints, useSetupEdit } from '@lun/core';
import { GlobalStaticConfig } from 'config';
import { defineIcon } from '../icon/Icon';

export const Button = defineCustomElement({
  name: GlobalStaticConfig.nameMap.button,
  props: {
    ...editStateProps,
    size: { type: [String, Object] as PropType<Responsive<'1' | '2' | '3'>>, default: '1' },
    asyncHandler: { type: Function as PropType<(e: MouseEvent) => void> },
    showLoading: { type: Boolean, default: true },
    iconPosition: { type: String as PropType<'left' | 'right'>, default: 'left' },
  },
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
      return (
        <button
          class={[buttonSizeClass.value]}
          aria-disabled={finalDisabled}
          disabled={finalDisabled}
          onClick={handler.onClick}
          part="button"
        >
          {/* TODO use Icon */}
          {props.iconPosition === 'left' && props.showLoading && loading ? 'loading...' : <slot name="icon"></slot>}
          <slot></slot>
          {props.iconPosition === 'right' && props.showLoading && loading ? 'loading...' : <slot name="icon"></slot>}
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

export function defineButton(buttonName?: string, iconName?: string) {
  defineIcon(iconName);
  buttonName ||= GlobalStaticConfig.nameMap.button;
  if (!customElements.get(buttonName)) {
    GlobalStaticConfig.actualNameMap['button'].add(buttonName);
    customElements.define(buttonName, Button);
  }
}
