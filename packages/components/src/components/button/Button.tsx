import { defineSSRCustomElement } from 'custom';
import { useSetupEdit } from '@lun/core';
import { defineSpin } from '../spin';
import { createDefineElement, renderElement } from 'utils';
import { buttonEmits, buttonProps } from './type';
import { useCEStates, useNamespace } from 'hooks';
import { Transition, computed, ref } from 'vue';
import { debounce, isFunction, throttle } from '@lun/utils';

const name = 'button';
export const Button = defineSSRCustomElement({
  name,
  props: buttonProps,
  emits: buttonEmits,
  setup(props, { emit }) {
    const ns = useNamespace(name);
    const [editComputed, editState] = useSetupEdit();

    let holdAnimationDone = false;
    const handleClick = computed(() => {
      const onClick = async (e?: MouseEvent) => {
        if (!editComputed.value.interactive) return;
        if (props.hold && !holdAnimationDone) return;
        holdAnimationDone = false;
        emit('validClick');
        if (isFunction(props.asyncHandler)) {
          editState.loading = true;
          Promise.resolve(props.asyncHandler(e)).finally(() => (editState.loading = false));
        }
      };
      if (+props.debounce! > 0) return debounce(onClick, props.debounce);
      else if (+props.throttle! > 0) return throttle(onClick, props.throttle);
      else return onClick;
    });

    const holdShow = ref(false);
    const hideHold = () => {
      holdShow.value = false;
    };

    const buttonHandlers = {
      onPointerdown() {
        if (props.hold && editComputed.value.interactive) holdShow.value = true;
      },
      onPointerup: hideHold,
      // find that pointerout will be fired when hold-on element grows to the pointer position, use pointerleave instead
      onPointerleave: hideHold,
      onPointercancel: hideHold,
      // In some mobile browsers, contextmenu and text selection will be fired when long press, need to prevent it when hold is true
      onContextmenu(e: MouseEvent) {
        if (holdShow.value) e.preventDefault();
      },
      onTouchstart(e: TouchEvent) {
        if (props.hold && editComputed.value.interactive) e.preventDefault();
      },
    };

    const holdTransitionHandlers = {
      onAfterEnter() {
        holdShow.value = false;
        holdAnimationDone = true;
        handleClick.value();
      },
    };

    const [stateClass] = useCEStates(() => ({ 'hold-show': holdShow }), ns, editComputed);

    return () => {
      const { iconName, iconLibrary, size } = props;
      const { interactive, loading } = editComputed.value;
      const finalDisabled = !interactive;
      const spinProps = { size, ...props.spinProps, part: 'spin' };
      const loadingPart =
        loading && props.showLoading ? (
          renderElement('spin', spinProps)
        ) : (
          <slot name="icon">{iconName && renderElement('icon', { name: iconName, library: iconLibrary })}</slot>
        );
      return (
        <button
          {...buttonHandlers}
          class={stateClass.value}
          aria-disabled={finalDisabled}
          disabled={finalDisabled}
          onClick={handleClick.value}
          part="button"
          style={ns.v({ hold: props.hold && `${props.hold}ms` })}
        >
          <Transition name="hold" {...holdTransitionHandlers}>
            {holdShow.value && <div class="hold-enter-active" part="hold"></div>}
          </Transition>
          {props.iconPosition === 'start' && loadingPart}
          <slot>{props.label}</slot>
          {props.iconPosition === 'end' && loadingPart}
        </button>
      );
    };
  },
});

export type tButton = typeof Button;

export const defineButton = createDefineElement(name, Button, {
  spin: defineSpin,
});
