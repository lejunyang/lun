import { defineSSRCustomElement } from 'custom';
import { useSetupEdit } from '@lun/core';
import { defineSpin } from '../spin';
import { createDefineElement, renderElement } from 'utils';
import { buttonProps } from './type';
import { useNamespace } from 'hooks';
import { Transition, computed, ref } from 'vue';
import { debounce, isFunction, throttle } from '@lun/utils';

const name = 'button';
export const Button = defineSSRCustomElement({
  name,
  props: buttonProps,
  emits: ['lClick'],
  setup(props, { emit }) {
    const ns = useNamespace(name);
    const [editComputed, editState] = useSetupEdit();
    let holdAnimationDone = false;
    const handler = {
      async onClick(e?: MouseEvent) {
        if (!editComputed.value.interactive) return;
        if (props.holdOn && !holdAnimationDone) return;
        holdAnimationDone = false;
        emit('lClick');
        if (isFunction(props.asyncHandler)) {
          editState.loading = true;
          Promise.resolve(props.asyncHandler(e)).finally(() => (editState.loading = false));
        }
      },
      onPointerdown() {
        if (props.holdOn && editComputed.value.interactive) holdOnShow.value = true;
      },
      hideHoldOn() {
        holdOnShow.value = false;
      },
      onAfterEnter() {
        holdOnShow.value = false;
        holdAnimationDone = true;
        handleClick.value();
      },
      onContextmenu(e: MouseEvent) {
        // In some mobile browsers, contextmenu and text selection will be triggered when long press, need to prevent it when holdOn is true
        if (holdOnShow.value) e.preventDefault();
      },
    };
    const handleClick = computed(() => {
      if (props.debounce! > 0) return debounce(handler.onClick, props.debounce);
      else if (props.throttle! > 0) return throttle(handler.onClick, props.throttle);
      else return handler.onClick;
    });
    const holdOnShow = ref(false);

    return () => {
      const { interactive, loading } = editComputed.value;
      const finalDisabled = !interactive;
      const spinProps = { size: props.size, ...props.spinProps, part: 'spin' };
      const loadingPart = loading && props.showLoading ? renderElement('spin', spinProps) : <slot name="icon"></slot>;
      return (
        <button
          class={[...ns.s(editComputed)]}
          aria-disabled={finalDisabled}
          disabled={finalDisabled}
          onClick={handleClick.value}
          onPointerdown={handler.onPointerdown}
          onPointerup={handler.hideHoldOn}
          // find that pointerout will be triggered when hold-on element grows to the pointer position, use pointerleave instead
          onPointerleave={handler.hideHoldOn}
          onPointercancel={handler.hideHoldOn}
          onContextmenu={handler.onContextmenu}
          part="button"
          style={ns.v({ 'hold-on': props.holdOn && `${props.holdOn}ms` })}
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
