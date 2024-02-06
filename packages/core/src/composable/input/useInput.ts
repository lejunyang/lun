import {
  isEnterDown,
  isFunction,
  debounce as toDebounce,
  throttle as toThrottle,
  toArrayIfNotNil,
  getFirstOfIterable,
  toRegExp,
  isArray,
} from '@lun/utils';
import { ComputedRef, computed, reactive } from 'vue';
import { MaybeRefLikeOrGetter, unrefOrGet } from '../../utils';
import { processNumOptions, useNumberStep } from './useNumberStep';
import { presets } from '../../presets/index';

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
  min: number;
  max: number;
  precision: number | null;
  step: number | null;
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

function handleNumberBeforeInput(e: InputEvent, state: UseInputState<UseInputOptions>) {
  const { type, min, max, noExponent, precision, step, strictStep, replaceChPeriodMark } = state.transformedOptions;

  if (e.data === '' && state.prevValue !== null && e.inputType === 'insertCompositionText') {
    // one special case. during composition, if we input something invalid and then delete all the composition text, e.data will be ''
    // but we have stored the prevValue, and that will prevent next input, so we need to clear it in this case
    state.prevValue = state.prevSelectionStart = null;
  }

  if (!e.data || (type !== 'number' && type !== 'number-string')) return;
  const target = e.target as HTMLInputElement;

  const cancel = () => {
    if (e.cancelable) e.preventDefault();
    else if (type === 'number-string' && state.prevValue === null) {
      // if not cancelable(like composition), store value and selectionStart, selectionEnd so that we can restore them later update
      // need to do this when state.prevValue is null, as beforeInput will trigger twice, one is before input, one is before composition end
      state.prevValue = target.value;
      state.prevSelectionStart = target.selectionStart;
      state.prevSelectionEnd = target.selectionEnd;
      console.log('update preValue', state.prevValue, e);
    }
  };

  const { isInteger, getZero, equals, greaterThanOrEqual, lessThanOrEqual } = presets.math;
  const zero = getZero();
  const noDecimal = (precision !== null && equals(precision, zero)) || (strictStep && step && isInteger(step));
  const noNegative = greaterThanOrEqual(min, zero);
  const noNegativeSymbol = noNegative && (noExponent || noDecimal); // negative symbol is also allowed even if min >= 0, for example 1e-2(but require noDecimal === false)
  let allowedChars = `${replaceChPeriodMark ? '。' : ''}${noExponent ? '' : 'eE'}${noNegativeSymbol ? '' : '\\-'}${
    lessThanOrEqual(max, 0) ? '' : '+'
  }${noDecimal ? '' : '.'}`;
  if (e.data && e.data.match(new RegExp(`[^\\s0-9${allowedChars}]`))) {
    cancel();
    console.log('prevented! allowedChars', allowedChars, e.defaultPrevented, state.prevValue);
    return;
  }
  // below codes rely on selectionStart and selectionEnd. Input element of type=number does not support selectionStart and selectionEnd.
  if (target?.selectionStart == null) return;
  const selectionStart = target.selectionStart || 0,
    selectionEnd = target.selectionEnd || 0;
  const { value } = target;
  let nextVal = value.substring(0, selectionStart) + e.data + value.substring(selectionEnd);
  nextVal = nextVal.replace(/\s/g, ''); // eliminate all spaces
  console.log('nextVal', nextVal);
  const firstChar = nextVal.charAt(0);
  const isNegative = firstChar === '-',
    isPositive = firstChar === '+';
  if (isNegative && noNegative) cancel();
  if (isNegative || isPositive)
    // remove the first symbol
    nextVal = nextVal.substring(1);
  // [-+]?[0-9]*([.。][0-9]*)?((e|E)[-+]?[0-9]*)? // TODO use a single regex to check?
  // first split by '.' and '。‘ if replaceChPeriodMark
  const splitsByDot = nextVal.split(new RegExp(`[${replaceChPeriodMark ? '。' : ''}.]`));
  const splitsByDotLen = splitsByDot.length;
  // if splitsByDotLen = 1, it's an integer with a scientific notation part
  // if splitsByDotLen = 2, splitsByDot[0] is the integer part, splitsByDot[1] is the decimal part with a scientific notation part
  console.log('splitsByDot', splitsByDot);
  // length > 2, more than two dot symbols, prevent;
  // length = 1, no dot symbol, check if any +- symbols exist before eE;
  // length = 2, index = 0 is the integer part, check if any useless symbols exist in the integer part
  if (
    splitsByDotLen > 2 ||
    (splitsByDotLen === 1 && splitsByDot[0].match(/(?<![eE])[-+]/)) ||
    (splitsByDotLen === 2 && splitsByDot[0].match(/[-+eE]/))
  )
    return cancel();
  const rightPart = splitsByDot[splitsByDotLen - 1];
  const splitsByE = rightPart.split(/[eE]/);
  const splitsByELen = splitsByE.length;
  console.log('splitsByE', splitsByE);
  if (splitsByELen > (noExponent ? 1 : 2)) return cancel();
  // '-+' can not exist in the decimal part
  if (splitsByE[0].match(/[-+]/)) return cancel();
  // if exponent, '-' is allowed only when noDecimal is false
  if (splitsByELen === 2 && splitsByE[1] && !splitsByE[1].match(new RegExp(`^[${noDecimal ? '' : '-'}+]?\\d*$`)))
    return cancel();
}

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
      return !newValue && newValue !== 0 && (toNullWhenEmpty || type === 'number-string') ? null : newValue;
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
          // native input[type="number"] will eliminate all spaces, we follow that
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
