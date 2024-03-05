import {
  isEnterDown,
  isFunction,
  debounce as toDebounce,
  throttle as toThrottle,
  toArrayIfNotNil,
  getFirstOfIterable,
  toRegExp,
  isArray,
  isTruthyOrZero,
  BigIntDecimal,
} from '@lun/utils';
import { ComputedRef, computed, reactive } from 'vue';
import { MaybeRefLikeOrGetter, unrefOrGet } from '../../utils';
import { processNumOptions, useNumberStep } from './useNumberStep';
import { presets } from '../../presets/index';
import { handleNumberBeforeInput } from './utils';

export type InputPeriod = 'change' | 'input' | 'not-composing';
export type InputPeriodWithAuto = InputPeriod | 'auto';
export type InputType = 'string' | 'number' | 'number-string';

export const isNumberInputType = (type: any) => type === 'number' || type === 'number-string';

export type UseInputOptions = {
  value?: MaybeRefLikeOrGetter<string | number>;
  type?: InputType;
  multiple?: boolean;
  disabled?: boolean;
  onChange: (val: string | number | null) => void;
  updateWhen?: InputPeriodWithAuto | InputPeriodWithAuto[];
  debounce?: number | string;
  throttle?: number | string;
  waitOptions?: any;
  trim?: boolean;
  maxLength?: number | string;
  restrict?: string | RegExp;
  restrictWhen?: InputPeriod | 'beforeInput' | (InputPeriod | 'beforeInput')[];
  toNullWhenEmpty?: boolean;
  transform?: (val: string | number | null) => string | number | null;
  transformWhen?: InputPeriod | InputPeriod[];
  onEnterDown?: (e: KeyboardEvent) => void;
  /**
   * enterDown event will not be emitted when composing by default
   */
  emitEnterDownWhenComposing?: boolean;

  min?: string | number;
  max?: string | number;
  precision?: string | number;
  step?: string | number;
  strictStep?: boolean;
  noExponent?: boolean;
  /**
   * if it's true and type is 'number-string', will replace '。' with '.', so that users can input dot mark directly under chinese input method
   */
  replaceChPeriodMark?: boolean;
};

type TransformedOption = {
  min: BigIntDecimal;
  max: BigIntDecimal;
  precision: BigIntDecimal | null;
  step: BigIntDecimal | null;
  updateWhen: Set<InputPeriod>;
  restrictWhen: Set<InputPeriod | 'beforeInput'>;
  transformWhen: Set<InputPeriod>;
};
export type TransformedUseInputOption<T> = Omit<T, keyof TransformedOption> & TransformedOption;

export type UseInputState<T> = {
  composing: boolean;
  transformedOptions: TransformedUseInputOption<T>;
  prevValue: string | null;
  prevSelectionStart: number | null;
  prevSelectionEnd: number | null;
};

export function useInput(
  optionsGetter: MaybeRefLikeOrGetter<UseInputOptions>,
  extraHandlers?: { transform?: (val: any, e: Event) => any } & Partial<
    Record<
      'onBeforeinput' | 'onInput' | 'onChange' | 'onCompositionstart' | 'onCompositionend' | 'onKeydown',
      (
        e: Event,
        state: UseInputState<UseInputOptions>,
        utils: {
          transformValue(actionNow: InputPeriod, value: string): any;
          handleEvent(actionNow: InputPeriod, e: Event): void;
        },
      ) => void
    >
  >,
) {
  const options = computed(() => {
    const result = unrefOrGet(optionsGetter)!;
    const {
      onChange,
      debounce,
      throttle,
      waitOptions,
      updateWhen: originalUpdate,
      multiple,
      transformWhen: originalTransform,
      restrictWhen: originalRestrict,
    } = result;
    const updateWhen = new Set(toArrayIfNotNil(originalUpdate!));
    if (updateWhen.has('auto') || !updateWhen.size) updateWhen.add(multiple ? 'change' : 'not-composing');
    updateWhen.delete('auto');
    const transformWhen = new Set(toArrayIfNotNil(originalTransform!));
    if (!transformWhen.size) transformWhen.add('not-composing');
    const restrictWhen = new Set(toArrayIfNotNil(originalRestrict!));
    if (!restrictWhen.size) restrictWhen.add('not-composing');
    return {
      ...processNumOptions(result),
      updateWhen: updateWhen as Set<InputPeriod>,
      transformWhen,
      restrictWhen,
      onChange: debounce
        ? toDebounce(onChange, debounce, waitOptions)
        : throttle
        ? toThrottle(onChange, throttle, waitOptions)
        : onChange,
    };
  });
  const state = reactive({
    composing: false,
    transformedOptions: options,
    prevValue: null,
    prevSelectionStart: null,
    prevSelectionEnd: null,
  });
  const utils = {
    transformValue(actionNow: InputPeriod, value: string | number | null) {
      const { transform, transformWhen, toNullWhenEmpty, type } = options.value;
      if (!transformWhen.has(actionNow)) return value;
      let newValue = value;
      if (isFunction(transform)) newValue = transform(newValue);
      // if type === 'number-string', force to null when empty
      return !isTruthyOrZero(newValue) && (toNullWhenEmpty || type === 'number-string') ? null : newValue;
    },
    handleEvent(actionNow: InputPeriod, e: Event) {
      const {
        updateWhen,
        restrict,
        replaceChPeriodMark,
        trim,
        maxLength,
        restrictWhen,
        onChange,
        type = 'text',
      } = options.value;
      const target = e.target as HTMLInputElement;
      let value = state.prevValue ?? target.value; // there is invalid value if prevValue is not null, need to restore it later
      console.log('handle event', actionNow, 'prev', state.prevValue, 'target.value', target.value);
      if (restrictWhen.has(actionNow)) {
        if (type === 'number-string') {
          // native input[type="number"] will eliminate all spaces when pasting or inputting, we follow that
          value = value.replace(/\s/g, '');
          if (replaceChPeriodMark) value = value.replace(/。/g, '.');
        }
        if (restrict) {
          const regex = toRegExp(restrict, 'g');
          value = target.value.replace(regex, '');
        }
        if (maxLength != null) {
          const end = +maxLength;
          if (end >= 0) value = value.substring(0, end);
        }
        // Only reassign when value has changed
        // When type = number, value is an empty string when it's not a valid number, you can't assign target.value at that moment otherwise the input will be cleared
        // For example, you input '-', trigger input event, but value is '', if you set target.value = '', input will be cleared
        if (value !== target.value) {
          // const { selectionStart, selectionEnd } = target;
          target.value = value;
          if (state.prevSelectionStart !== null) {
            target.selectionStart = state.prevSelectionStart;
            target.selectionEnd = state.prevSelectionEnd;
          }
          state.prevValue = state.prevSelectionStart = null;
          // If value of input is changed during composition, current composition will be invalid, need to refocus the input to remove the composition
          // It's very hacky, don't use it for now
          // if (state.composing && actionNow === 'input') {
          //   target.blur();
          //   setTimeout(() => {
          //     target.focus();
          //     target.selectionStart = selectionStart! - 1;
          //     target.selectionEnd = selectionEnd! - 1;
          //   }, 10);
          // }
        }
      }
      // ignore restrictWhen, trim only when actionNow is change, otherwise it will prevent inputting whitespace in the middle
      if (actionNow === 'change' && trim) {
        const trimmed = target.value.trim();
        if (trimmed !== target.value) {
          target.value = trimmed; // same as above, only reassign when value has changed
        }
      }
      if ((updateWhen.has(actionNow) || value !== target.value) && state.prevValue === null) {
        let transformedVal = utils.transformValue(actionNow, type === 'number' ? target.valueAsNumber : target.value);
        transformedVal = extraHandlers?.transform ? extraHandlers.transform(transformedVal, e) : transformedVal;
        if (type === 'number-string' && transformedVal != null && !isArray(transformedVal)) {
          if (presets.math.isNaN(presets.math.toNumber(transformedVal))) {
            console.log('NaN transformedVal', transformedVal, target.value);
            // if it's NaN, means it's something like 1e, don't call onChange until the value is valid
            return;
          }
        }
        onChange(transformedVal);
      }
    },
  };

  const { numberHandlers, ...otherNum } = useNumberStep(
    options as ComputedRef<TransformedUseInputOption<UseInputOptions>>,
  );

  const handlers = {
    onBeforeinput(_e: Event) {
      // state.prevValue = null;
      const e = _e as InputEvent;
      const target = e.target as HTMLInputElement;
      console.log('before input', e.data, e);
      console.log({
        dir: target.selectionDirection,
        start: target.selectionStart,
        end: target.selectionEnd,
        startChar: target.value.charAt(target.selectionStart || 0),
        range: [...e.getTargetRanges()],
      });

      // native number: 粘贴内容如果包含原来就输不进去的内容，那么就取消粘贴，但是空白字符除外，空白字符都会被消除。发现native奇怪的问题，双击空格，会输入小数点
      let { restrict, restrictWhen } = options.value;
      handleNumberBeforeInput(e, state);
      if (e.defaultPrevented) return;
      if (e.data && restrict && restrictWhen.has('beforeInput') && e.inputType.startsWith('insert')) {
        const nextVal =
          target.value.substring(0, target.selectionStart || 0) +
          e.data +
          target.value.substring(target.selectionEnd || 0);
        console.log('before input nextVal', nextVal);
        const regex = toRegExp(restrict, 'g');
        if (nextVal.match(regex)) {
          // found that if e.isComposing is true, e.preventDefault() will not work... it's not cancelable when composing
          e.preventDefault();
          // e.target.value = e.target.value; // reassign value can prevent input
        }
      }
    },
    onInput(e: Event) {
      console.log('input', e.cancelable);
      utils.handleEvent('input', e);
      // 发现一个问题，如果在input里面消除了composition的字符，后续的输入会不断触发compositionStart
      if (!state.composing) utils.handleEvent('not-composing', e);
    },
    onChange(e: Event) {
      const { updateWhen } = options.value;
      console.log('change');
      utils.handleEvent('change', e);
      // inspired by vue3 v-model
      // Safari < 10.2 & UIWebView doesn't fire compositionend when switching focus before confirming composition choice
      // this also fixes the issue where some browsers e.g. iOS Chrome fires "change" instead of "input" on autocomplete.
      if (state.composing && !updateWhen.has('change')) {
        state.composing = false;
        utils.handleEvent(getFirstOfIterable(updateWhen)!, e);
      }
    },
    onCompositionstart() {
      state.composing = true;
    },
    onCompositionend(e: Event) {
      state.composing = false;
      console.log('composition end');
      utils.handleEvent('not-composing', e);
    },
    onKeydown(e: KeyboardEvent) {
      const { onEnterDown, emitEnterDownWhenComposing = false } = options.value;
      if (isEnterDown(e)) {
        if ((!state.composing || emitEnterDownWhenComposing) && isFunction(onEnterDown)) onEnterDown(e);
      }
      numberHandlers.onKeydown(e);
    },
  };
  if (extraHandlers) {
    Object.keys(handlers).forEach((_k) => {
      const k = _k as keyof typeof handlers;
      if (k in extraHandlers && isFunction(extraHandlers[k])) {
        const original = handlers[k];
        handlers[k] = ((e: any) => {
          original(e);
          extraHandlers[k]!(e, state, utils);
        }) as any;
      }
    });
  }

  return {
    handlers,
    state,
    ...otherNum,
  };
}
