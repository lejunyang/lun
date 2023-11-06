import { defineSSRCustomElement } from 'custom';
import { useSetupEdit } from '@lun/core';
import { defineSpin } from '../spin';
import { createDefineElement, renderElement } from 'utils';
import { buttonProps } from './type';
import { useNamespace } from 'hooks';
import { Transition, ref } from 'vue';

const name = 'button';
export const Button = defineSSRCustomElement({
  name,
  props: buttonProps,
  emits: ['click'],
  setup(props, { emit }) {
    const ns = useNamespace(name);
    const [editComputed, editState] = useSetupEdit();
    const handler = {
      async onClick(e: MouseEvent) {
        if (editComputed.value.disabled || editComputed.value.loading) return;
        if (props.holdOn) {
          e.stopPropagation();
          return;
        }
        if (props.asyncHandler instanceof Function) {
          editState.loading = true;
          Promise.resolve(props.asyncHandler(e)).finally(() => (editState.loading = false));
        }
      },
      onPointerdown() {
        if (props.holdOn) holdOnShow.value = true;
      },
      hideHoldOn() {
        holdOnShow.value = false;
      },
      onAfterEnter() {
        holdOnShow.value = false;
        emit('click');
      },
    };
    const holdOnShow = ref(false);

    return () => {
      const { disabled, loading } = editComputed.value;
      const finalDisabled = !!(disabled || loading);
      const spinProps = { size: props.size, ...props.spinProps, part: 'spin' };
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
          onPointerdown={handler.onPointerdown}
          onPointerup={handler.hideHoldOn}
          // find that pointerout will be triggered when hold-on element grows to the pointer position, use pointerleave instead
          onPointerleave={handler.hideHoldOn}
          onPointercancel={handler.hideHoldOn}
          part="button"
          style={ns.v({ 'hold-on': `${props.holdOn}ms` })}
        >
          <Transition name="hold" onAfterEnter={handler.onAfterEnter}>
            {holdOnShow.value && <div part="hold"></div>}
          </Transition>
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
