import { numberRegex } from "@lun/utils";
import { presets } from "../../presets";
import { UseInputOptions, UseInputState } from "./useInput";

export function handleNumberBeforeInput(e: InputEvent, state: UseInputState<UseInputOptions>) {
  const { type, min, max, noExponent, precision, step, strictStep, replaceChPeriodMark } = state.transformedOptions;

  if (e.data === '' && state.prevValue !== null && e.inputType === 'insertCompositionText') {
    // one special case. during composition, if we input something invalid and then delete all the composition text, e.data will be ''
    // but we have stored the prevValue, and that will prevent next input, so we need to clear it in that case
    state.prevValue = state.prevSelectionStart = null;
  }

  if (!e.data || (type !== 'number' && type !== 'number-string')) return;
  const target = e.target as HTMLInputElement;

  const cancel = () => {
    if (e.cancelable) e.preventDefault();
    else if (type === 'number-string' && state.prevValue === null) {
      // if not cancelable(like composition), store value and selectionStart, selectionEnd so that we can restore them in later update
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
  // input[type=number] allows pasting a string with spaces, it will eliminate them. so we need to allow spaces
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
  if (!nextVal.match(numberRegex)) cancel();
  return;
  const firstChar = nextVal.charAt(0);
  const isNegative = firstChar === '-',
    isPositive = firstChar === '+';
  if (isNegative && noNegative) cancel();
  if (isNegative || isPositive)
    // remove the first symbol
    nextVal = nextVal.substring(1);
  // [-+]?[0-9]*([.。][0-9]*)?((e|E)[-+]?[0-9]*)? // TODO use a single regex to check or check like above?
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
