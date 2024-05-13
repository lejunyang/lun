import { defineSSRCustomElement } from 'custom';
import { useSetupEdit } from '@lun/core';
import { defineSpin } from '../spin';
import { createDefineElement, renderElement } from 'utils';
import { buttonEmits, buttonProps } from './type';
import { useCEExpose, useCEStates, useNamespace } from 'hooks';
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

    const [stateClass] = useCEStates(() => ({ holdShow }), ns, editComputed);

    let timer: ReturnType<typeof setInterval>,
      countdownTxt = ref<string | null>();
    const clear = () => {
      clearInterval(timer);
      countdownTxt.value = null;
      editState.loading = false;
    };
    const timeoutMethods = {
      setTimeout(timeout: number, getCountdownTxt = (remain: number) => `(${remain / 1000}s)`, interval = 1000) {
        clear();
        editState.loading = true;
        countdownTxt.value = getCountdownTxt(timeout);
        timer = setInterval(() => {
          if ((timeout -= interval) <= 0) {
            clear();
            emit('timeout');
          }
          countdownTxt.value = getCountdownTxt(timeout);
        }, interval);
      },
      clearTimeout: clear,
    };
    useCEExpose(timeoutMethods);

    return () => {
      const { iconName, iconLibrary, size, spinProps, showLoading, hold, label, iconPosition } = props;
      const { interactive, loading } = editComputed.value;
      const finalDisabled = !interactive;
      const finalSpinProps = { size, ...spinProps, part: 'spin' };
      const loadingPart =
        loading && showLoading ? (
          countdownTxt.value || renderElement('spin', finalSpinProps)
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
          part={ns.p('root')}
          style={ns.v({ hold: hold && `${hold}ms` })}
        >
          <Transition name="hold" {...holdTransitionHandlers}>
            {holdShow.value && <div part="hold"></div>}
          </Transition>
          {iconPosition === 'start' && loadingPart}
          <slot>{label}</slot>
          {iconPosition === 'end' && loadingPart}
        </button>
      );
    };
  },
});

export type tButton = typeof Button;
export type iButton = InstanceType<tButton> & {
  setTimeout(timeout: number, getCountdownTxt?: (remain: number) => string, interval?: number): void;
  clearTimeout(): void;
};

export const defineButton = createDefineElement(name, Button, {
  spin: defineSpin,
});
