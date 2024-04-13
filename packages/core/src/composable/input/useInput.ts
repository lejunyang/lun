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
  objectKeys,
} from '@lun/utils';
import { ComputedRef, computed, reactive } from 'vue';
import { MaybeRefLikeOrGetter, unrefOrGet } from '../../utils';
import { processNumOptions, useNumberStep } from './useNumberStep';
import { presets } from '../../presets/index';
import { handleNumberBeforeInput, isNumberInputType, nextValueAfterInput } from './utils';

export type InputPeriod = 'change' | 'input' | 'not-composing';
export type InputPeriodWithAuto = InputPeriod | 'auto';
export type InputType = 'string' | 'text' | 'number' | 'number-text' | 'password';

export type UseInputOptions = {
  value?: MaybeRefLikeOrGetter<string | number>;
  type?: InputType;
  multiple?: boolean;
  disabled?: boolean;
  onChange: (val: string | number | null, targetValue?: string) => void;
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
  moreThan?: string | number;
  lessThan?: string | number;
  precision?: string | number;
  step?: string | number;
  strict?: boolean;
  noExponent?: boolean;
  /**
   * if it's true and type is 'number-text', will replace '。' with '.', so that users can input dot mark directly under chinese input method
   */
  replaceChPeriodMark?: boolean;
  /** will normalize number in change event, meaning 1.2E2 => 120, 1.20 => 1.2 */
  normalizeNumber?: boolean;
};

type TransformedOption = {
  min: BigIntDecimal;
  max: BigIntDecimal;
  moreThan: BigIntDecimal;
  lessThan: BigIntDecimal;
  noPositive: boolean;
  noNegative: boolean;
  noDecimal: boolean;
  precision: BigIntDecimal | null;
  step: BigIntDecimal | null;
  updateWhen: Set<InputPeriod>;
  restrictWhen: Set<InputPeriod | 'beforeInput'>;
  transformWhen: Set<InputPeriod>;
  notAllowedNumReg: RegExp;
  adjustPrecision: <T extends string | number | null | BigIntDecimal>(value: T) => T;
  makeDivisibleByStep: <T extends string | number | null | BigIntDecimal>(value: T, isAdd?: boolean) => T;
  clampToRange: <T extends string | number | null | BigIntDecimal>(value: T) => T;
  processNum: <T extends string | number | null | BigIntDecimal>(
    value?: T,
    greater?: boolean,
  ) => number | null | BigIntDecimal;
};
export type TransformedUseInputOption<T> = Omit<T, keyof TransformedOption> & TransformedOption;

export type UseInputState<T> = {
  composing: boolean;
  transformedOptions: TransformedUseInputOption<T>;
  prevValue: string | null;
  prevSelectionStart: number | null;
  prevSelectionEnd: number | null;
  focusing: boolean;
};

export function useInput(
  optionsGetter: MaybeRefLikeOrGetter<UseInputOptions>,
  extraHandlers?: { transform?: (val: any, e: Event) => any } & Partial<
    Record<
      | 'onBeforeinput'
      | 'onInput'
      | 'onChange'
      | 'onCompositionstart'
      | 'onCompositionend'
      | 'onKeydown'
      | 'onFocus'
      | 'onBlur',
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
    } as TransformedUseInputOption<UseInputOptions>;
  });
  const state = reactive({
    composing: false,
    transformedOptions: options,
    /** store the previous valid value when invalid chars occur in composition */
    prevValue: null,
    prevSelectionStart: null,
    prevSelectionEnd: null,
    focusing: false,
  });
  const utils = {
    transformValue(actionNow: InputPeriod, value: string | number | null) {
      const { transform, transformWhen, toNullWhenEmpty, type } = options.value;
      if (!transformWhen.has(actionNow)) return value;
      let newValue = value;
      if (isFunction(transform)) newValue = transform(newValue);
      // if it's number type, force to null when empty(type=number, value is NaN, type=number-text, value is '')
      return !isTruthyOrZero(newValue) && (toNullWhenEmpty || isNumberInputType(type)) ? null : newValue;
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
        normalizeNumber,
        processNum,
      } = options.value;
      const target = e.target as HTMLInputElement;
      let value = state.prevValue ?? target.value; // there is invalid value if prevValue is not null, need to restore it later
      if (restrictWhen.has(actionNow)) {
        if (type === 'number-text') {
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

      const { isNaN, toNumber } = presets.math;

      // ignore restrictWhen, some behaviors must be performed in change. take trim as example, it will prevent inputting whitespace in the middle if we trim in the input event
      if (actionNow === 'change') {
        if (trim) {
          const trimmed = target.value.trim();
          if (trimmed !== target.value) {
            target.value = trimmed; // same as above, only reassign when value has changed
          }
        }
        if (isNumberInputType(type)) {
          const newVal = String(processNum(target.value));
          if (newVal !== target.value) target.value = newVal;
          if (normalizeNumber) target.value = String(toNumber(target.value));
        }
      }
      if ((updateWhen.has(actionNow) || value !== target.value) && state.prevValue === null) {
        let transformedVal = utils.transformValue(actionNow, type === 'number' ? target.valueAsNumber : target.value);
        transformedVal = extraHandlers?.transform ? extraHandlers.transform(transformedVal, e) : transformedVal;
        if (type === 'number-text' && transformedVal != null && !isArray(transformedVal)) {
          if (isNaN(toNumber(transformedVal))) {
            // if it's NaN, means it's something like 1e, don't call onChange until the value is valid
            return;
          }
        }
        onChange(transformedVal, target.value);
      }
    },
  };

  const { numberHandlers, ...otherNumReturn } = useNumberStep(
    options as ComputedRef<TransformedUseInputOption<UseInputOptions>>,
  );

  const handlers = {
    onBeforeinput(_e: Event) {
      const e = _e as InputEvent;
      const target = e.target as HTMLInputElement;

      const { restrict, restrictWhen } = options.value;
      handleNumberBeforeInput(e, state);
      if (e.defaultPrevented) return;

      // it's not cancelable when composing
      if (restrict && restrictWhen.has('beforeInput') && e.data && e.cancelable && e.inputType.startsWith('insert')) {
        const nextVal = nextValueAfterInput(target, e);
        const regex = toRegExp(restrict, 'g');
        if (nextVal.match(regex)) {
          e.preventDefault();
          // e.target.value = e.target.value; // reassign value can prevent input even not cancelable, but
        }
      }
    },
    onInput(e: Event) {
      utils.handleEvent('input', e);
      // found a issue, if we eliminate the composition text in input event, continuous input will trigger compositionStart constantly
      if (!state.composing) utils.handleEvent('not-composing', e);
    },
    onChange(e: Event) {
      const { updateWhen } = options.value;
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
      utils.handleEvent('not-composing', e);
    },
    onKeydown(e: KeyboardEvent) {
      const { onEnterDown, emitEnterDownWhenComposing = false } = options.value;
      if (isEnterDown(e)) {
        if ((!state.composing || emitEnterDownWhenComposing) && isFunction(onEnterDown)) onEnterDown(e);
      }
      numberHandlers.onKeydown(e);
    },
    onFocus() {
      state.focusing = true;
    },
    onBlur(e: FocusEvent) {
      state.focusing = false;
      const target = e.target as HTMLInputElement;
      // native type=number can input something like --, --2321, ++3, at that time, target.value is '', and it won't trigger change event, we need to clear it manually
      if (options.value.type === 'number' && !target.value) target.value = '';
    },
  };
  if (extraHandlers) {
    objectKeys(handlers).forEach((k) => {
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
    ...otherNumReturn,
  };
}
