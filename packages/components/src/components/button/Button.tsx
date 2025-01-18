import { defineCustomElement } from 'custom';
import { unrefOrGet, useSetupEdit } from '@lun-web/core';
import { defineSpin } from '../spin';
import { createDefineElement, renderElement } from 'utils';
import { buttonEmits, buttonProps } from './type';
import { interceptCEMethods, useCEExpose, useCEStates, useNamespace } from 'hooks';
import { Transition, computed, ref } from 'vue';
import { debounce as dF, isFunction, prevent, throttle as tF, copyText as copy, promiseTry } from '@lun-web/utils';
import { getCompParts } from 'common';

const name = 'button';
const parts = ['root', 'spin', 'hold'] as const;
const compParts = getCompParts(name, parts);
export const Button = defineCustomElement({
  name,
  props: buttonProps,
  emits: buttonEmits,
  setup(props, { emit }) {
    const ns = useNamespace(name);
    const [editComputed, editState] = useSetupEdit();
    const button = ref<HTMLButtonElement>();

    let holdAnimationDone = false;
    const handleClick = computed(() => {
      const onClick = async (e?: MouseEvent) => {
        if (!editComputed.interactive) return;
        const { hold, asyncHandler, copyText } = props;
        if (hold && !holdAnimationDone) return;
        holdAnimationDone = false;
        emit('validClick');
        const text = unrefOrGet(copyText);
        if (text)
          promiseTry(copy, text)
            /** @ts-expect-error */
            .then((res) => (res ? emit('copySuccess') : emit('copyFail')))
            .catch((e) => emit('copyFail', e));
        if (isFunction(asyncHandler)) {
          editState.loading = true;
          promiseTry(asyncHandler, e).finally(() => (editState.loading = false));
        }
      };
      const { debounce, throttle } = props;
      if (+debounce! > 0) return dF(onClick, debounce);
      else if (+throttle! > 0) return tF(onClick, throttle);
      else return onClick;
    });

    const holdShow = ref(false);
    const hideHold = () => {
      holdShow.value = false;
    };

    const buttonHandlers = {
      onPointerdown() {
        if (props.hold && editComputed.interactive) holdShow.value = true;
      },
      onPointerup: hideHold,
      // find that pointerout will be fired when hold-on element grows to the pointer position, use pointerleave instead
      onPointerleave: hideHold,
      onPointercancel: hideHold,
      // In some mobile browsers, contextmenu and text selection will be fired when long press, need to prevent it when hold is true
      onContextmenu(e: MouseEvent) {
        if (holdShow.value) prevent(e);
      },
      onTouchstart(e: TouchEvent) {
        if (props.hold && editComputed.interactive) prevent(e);
      },
    };

    const holdTransitionHandlers = {
      onAfterEnter() {
        holdShow.value = false;
        holdAnimationDone = true;
        handleClick.value();
      },
    };

    const [stateClass] = useCEStates(() => ({ holdShow }));

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
    interceptCEMethods(button);

    return () => {
      const { iconName, iconLibrary, size, spinProps, showLoading, hold, label, iconPosition } = props;
      const { interactive, loading } = editComputed;
      const finalDisabled = !interactive;
      const finalSpinProps = { size, ...spinProps, part: compParts[1] };
      const loadingPart =
        loading && showLoading ? (
          countdownTxt.value || renderElement('spin', finalSpinProps)
        ) : (
          <slot name="icon">{iconName && renderElement('icon', { name: iconName, library: iconLibrary })}</slot>
        );
      return (
        <button
          {...buttonHandlers}
          ref={button}
          class={stateClass.value}
          aria-disabled={finalDisabled}
          disabled={finalDisabled}
          onClick={handleClick.value}
          part={compParts[0]}
          style={ns.v({ hold: hold && `${hold}ms` })}
        >
          <Transition name="hold" {...holdTransitionHandlers}>
            {holdShow.value && <div part={compParts[2]}></div>}
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
export type ButtonExpose = {
  setTimeout(timeout: number, getCountdownTxt?: (remain: number) => string, interval?: number): void;
  clearTimeout(): void;
};
export type iButton = InstanceType<tButton> & ButtonExpose;

export const defineButton = createDefineElement(
  name,
  Button,
  {
    showLoading: true,
    iconPosition: 'start',
    // variant: 'surface',
  },
  parts,
  [defineSpin],
);
