import {
  ensureNumber,
  isEnterDown,
  isFunction,
  toNumberOrNull,
  debounce as toDebounce,
  throttle as toThrottle,
  toArrayIfNotNil,
  getFirstOfIterable,
  toRegExp,
} from '@lun/utils';
import { computed, reactive } from 'vue';
import { MaybeRefLikeOrGetter, unrefOrGet } from '../../utils';
export type InputPeriod = 'change' | 'input' | 'not-composing';
export type InputPeriodWithAuto = InputPeriod | 'auto';
export type InputType = 'text' | 'number' | 'number-text';

export type UseInputOptions<
  IType extends InputType = 'text',
  T = InputType extends 'number' | 'number-text' ? number : string,
> = {
  type?: IType;
  multiple?: boolean;
  onChange: (val: T | null) => void;
  updateWhen?: InputPeriodWithAuto | InputPeriodWithAuto[];
  debounce?: number | string;
  throttle?: number | string;
  waitOptions?: any;
  trim?: boolean;
  maxLength?: number | string;
  restrict?: string | RegExp;
  restrictWhen?: InputPeriod | 'beforeInput' | (InputPeriod | 'beforeInput')[];
  toNullWhenEmpty?: boolean;
  transform?: (val: T | null) => T | null;
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
   * if it's true and type is 'number-text', will replace '。' with '.', so that users can input dot mark directly under chinese input method
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
};

function handleNumberBeforeInput(
  e: InputEvent,
  {
    type,
    min,
    max,
    noExponent,
    precision,
    step,
    strictStep,
    replaceChPeriodMark,
  }: TransformedUseInputOption<UseInputOptions<'number', number>>,
) {
  if (!e.data || (type !== 'number' && type !== 'number-text')) return;
  const noDecimal = precision === 0 || (strictStep && step && Number.isInteger(step));
  const noNegativeSymbol = min >= 0 && noExponent; // negative symbol is also allowed even if min >= 0, for example 1e-2(but require noDecimal === false)
  let allowChars = `${replaceChPeriodMark ? '。' : ''}${noExponent ? '' : 'eE'}${noNegativeSymbol ? '' : '\\-'}${
    max <= 0 ? '' : '+'
  }${noDecimal ? '' : '.'}`;
  if (e.data && e.data.match(new RegExp(`[^\\s0-9${allowChars}]`))) {
    console.log('prevented', allowChars);
    return e.preventDefault();
  }
  const target = e.target as HTMLInputElement;
  // below codes rely on selectionStart and selectionEnd. The input element's type ('number') does not support selectionStart and selectionEnd.
  if (target?.selectionStart == null) return;
  const selectionStart = target.selectionStart || 0,
    selectionEnd = target.selectionEnd || 0;
  const { value } = target;
  let nextVal = value.substring(0, selectionStart) + e.data + target.value.substring(selectionEnd);
  nextVal = nextVal.replace(/\s/g, ''); // eliminate all spaces
  console.log('nextVal', nextVal);
  const firstChar = nextVal.charAt(0);
  const isNegative = firstChar === '-',
    isPositive = firstChar === '+';
  // remove the first symbol
  if (isNegative || isPositive) nextVal = nextVal.substring(1);
  // [-+]?[0-9]*.?([eE])?
  const splitsByDot = nextVal.split('.');
  console.log('splitsByDot', splitsByDot);
  // more than two dot symbols; if length = 2, index=0 is integer part, check if any useless symbols exist in the integer part
  if (splitsByDot.length > 2 || (splitsByDot.length === 2 && splitsByDot[0].match(/[-+eE]/))) return e.preventDefault();
  const rightPart = splitsByDot[splitsByDot.length - 1];
  const splitsByE = rightPart.split(/[eE]/);
  console.log('splitsByE', splitsByE);
  if (splitsByE.length > (noExponent ? 1 : 2)) return e.preventDefault();
  // if noExponent is true, '-+' can not exist in the decimal part
  if (splitsByE.length === 1 && splitsByE[0].match(/[-+]/)) return e.preventDefault();
  // if exponent, '-' is allowed only when noDecimal is false
  if (splitsByE.length === 2 && splitsByE[1] && !splitsByE[1].match(new RegExp(`[${noDecimal ? '' : '-'}+]?\\d+`)))
    return e.preventDefault();
}

export function useInput<
  IType extends InputType = 'text',
  ValueType extends string | number = IType extends 'number' | 'number-text' ? number : string,
  Handlers extends string =
    | 'onBeforeinput'
    | 'onInput'
    | 'onChange'
    | 'onCompositionstart'
    | 'onCompositionend'
    | 'onKeydown',
  E extends Function = (
    e: Event,
    state: UseInputState<UseInputOptions<IType, ValueType>>,
    utils: {
      transformValue(actionNow: InputPeriod, value: string): any;
      handleEvent(actionNow: InputPeriod, e: Event): void;
    },
  ) => void,
>(
  optionsGetter: MaybeRefLikeOrGetter<UseInputOptions<IType, ValueType>>,
  extraHandlers?: Partial<Record<Handlers, E> & { transform?: (val: any, e: Event) => any }>,
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
      ...result,
      updateWhen: updateWhen as Set<InputPeriod>,
      transformWhen,
      restrictWhen,
      min: ensureNumber(result.min, -Infinity),
      max: ensureNumber(result.max, Infinity),
      precision: toNumberOrNull(result.precision),
      step: toNumberOrNull(result.step),
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
  });
  const utils = {
    transformValue(actionNow: InputPeriod, value: string) {
      const { transform, transformWhen, toNullWhenEmpty = true } = options.value;
      if (!transformWhen.has(actionNow)) return value as ValueType;
      let newValue: ValueType | null = value as ValueType;
      if (isFunction(transform)) newValue = transform(newValue);
      return !newValue && newValue !== 0 && toNullWhenEmpty ? null : newValue;
    },
    handleEvent(actionNow: InputPeriod, e: Event) {
      const {
        updateWhen,
        restrict,
        replaceChPeriodMark = true,
        trim,
        maxLength,
        restrictWhen,
        onChange,
        type = 'text',
      } = options.value;
      const target = e.target as HTMLInputElement;
      let value = target.value;
      if (restrictWhen.has(actionNow)) {
        if (type === 'number-text') {
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
        // only reassign when value is changed
        // When type = number, value is a empty string when it's not a valid number, you can't assign target.value at this time otherwise the input will be cleared
        // For example, you input '-', trigger input event, but value is '', if you set target.value = '', input will be cleared
        if (value !== target.value) {
          // const { selectionStart, selectionEnd } = target;
          target.value = value;
          // value of input is changed during composition, current composition will be invalid, need to refocus the input to remove the composition
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
          target.value = trimmed; // same as above, only reassign when value is changed
        }
      }
      if (updateWhen.has(actionNow) || value !== target.value) {
        let transformedVal = utils.transformValue(actionNow, target.value);
        transformedVal = extraHandlers?.transform ? extraHandlers.transform(transformedVal, e) : transformedVal;
        onChange(
          // type.startsWith('number') && transformedVal != null
          // 	? (toNumberOrNull(transformedVal) as ValueType)
          // 	: transformedVal
          transformedVal,
        );
      }
    },
  };
  const handlers = {
    onBeforeinput(e: InputEvent) {
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
      handleNumberBeforeInput(e, options.value as TransformedUseInputOption<UseInputOptions<'number', number>>);
      if (e.defaultPrevented) return;
      if (e.data && restrict && restrictWhen.has('beforeInput') && e.inputType.startsWith('insert')) {
        const nextVal =
          target.value.substring(0, target.selectionStart || 0) +
          e.data +
          target.value.substring(target.selectionEnd || 0);
        console.log('before input nextVal', nextVal);
        const regex = toRegExp(restrict, 'g');
        if (nextVal.match(regex)) {
          // found that if e.isComposing is true, e.preventDefault() will not work...
          e.preventDefault();
          // e.target.value = e.target.value; // reassign value can prevent input
        }
      }
    },
    onInput(e: Event) {
      console.log('input');
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
    },
  } as Record<Handlers, (e: Event) => void>;
  if (extraHandlers) {
    Object.keys(handlers).forEach((_k) => {
      const k = _k as Handlers;
      if (k in extraHandlers && isFunction(extraHandlers[k])) {
        const original = handlers[k];
        handlers[k] = (e: any) => {
          original(e);
          extraHandlers[k]!(e, state, utils);
        };
      }
    });
  }
  return [handlers, state] as const;
}
