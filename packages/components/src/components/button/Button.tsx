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
  emits: ['validClick'],
  setup(props, { emit }) {
    const ns = useNamespace(name);
    const [editComputed, editState] = useSetupEdit();

    let holdAnimationDone = false;
    const handleClick = computed(() => {
      const onClick = async (e?: MouseEvent) => {
        if (!editComputed.value.interactive) return;
        if (props.holdOn && !holdAnimationDone) return;
        holdAnimationDone = false;
        emit('validClick');
        if (isFunction(props.asyncHandler)) {
          editState.loading = true;
          Promise.resolve(props.asyncHandler(e)).finally(() => (editState.loading = false));
        }
      };
      if (props.debounce! > 0) return debounce(onClick, props.debounce);
      else if (props.throttle! > 0) return throttle(onClick, props.throttle);
      else return onClick;
    });

    const holdOnShow = ref(false);
    const hideHoldOn = () => {
      holdOnShow.value = false;
    };

    const buttonHandlers = {
      onPointerdown() {
        if (props.holdOn && editComputed.value.interactive) holdOnShow.value = true;
      },
      onPointerup: hideHoldOn,
      // find that pointerout will be triggered when hold-on element grows to the pointer position, use pointerleave instead
      onPointerleave: hideHoldOn,
      onPointercancel: hideHoldOn,
      // In some mobile browsers, contextmenu and text selection will be triggered when long press, need to prevent it when holdOn is true
      onContextmenu(e: MouseEvent) {
        if (holdOnShow.value) e.preventDefault();
      },
      onTouchstart(e: TouchEvent) {
        if (props.holdOn && editComputed.value.interactive) e.preventDefault();
      },
    };

    const holdTransitionHandlers = {
      onAfterEnter() {
        holdOnShow.value = false;
        holdAnimationDone = true;
        handleClick.value();
      },
    };

    return () => {
      const { interactive, loading } = editComputed.value;
      const finalDisabled = !interactive;
      const spinProps = { size: props.size, ...props.spinProps, part: 'spin' };
      const loadingPart = loading && props.showLoading ? renderElement('spin', spinProps) : <slot name="icon"></slot>;
      return (
        <button
          {...buttonHandlers}
          class={[...ns.s(editComputed)]}
          aria-disabled={finalDisabled}
          disabled={finalDisabled}
          onClick={handleClick.value}
          part="button"
          style={ns.v({ 'hold-on': props.holdOn && `${props.holdOn}ms` })}
        >
          <Transition name="hold" {...holdTransitionHandlers}>
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

export const defineButton = createDefineElement(name, Button, {
  spin: defineSpin,
});
