import { isString, toRegExp } from '@lun/utils';
import { GlobalStaticConfig } from '../config';
import { Rule, ValidateMessages } from './type';
import { intl, processStringWithParams } from 'common';
import { isNumberInputType } from '@lun/core';

export const innerValidator = (value: any, _data: any, rule: Rule, msgs: ValidateMessages) => {
  const { type, min, max, greaterThan, lessThan, required, pattern, len } = rule;
  if (value == null)
    return required
      ? processStringWithParams(msgs.required, rule) ||
          intl('validation.required', rule).d(({ label }: any) => `Please enter ${label || 'this field'}`)
      : undefined;

  // ------------------ string ------------------
  if (type === 'string' || type === 'text') {
    // type === 'text' is for input element
    if (!isString(value))
      return processStringWithParams(msgs.type, rule) || intl('validation.string.type', rule).d('Must be a string');
    if (min !== undefined && value.length < min)
      return (
        processStringWithParams(msgs.min, rule) ||
        intl('validation.string.min', rule).d('Must be at least ${min} characters')
      );
    if (max !== undefined && value.length > max)
      return (
        processStringWithParams(msgs.max, rule) ||
        intl('validation.string.max', rule).d('Must be at most ${max} characters')
      );
    if (greaterThan !== undefined && value.length <= greaterThan)
      return (
        processStringWithParams(msgs.greaterThan, rule) ||
        intl('validation.string.greaterThan', rule).d('Must be longer than ${greaterThan} characters')
      );
    if (lessThan !== undefined && value.length >= lessThan)
      return (
        processStringWithParams(msgs.lessThan, rule) ||
        intl('validation.string.lessThan', rule).d('Must be shorter than ${lessThan} characters')
      );
  }
  // ------------------ string ------------------

  // ------------------ number ------------------
  const {
    greaterThan: G,
    lessThan: L,
    greaterThanOrEqual,
    lessThanOrEqual,
    toNumber,
    isNaN,
    isNumber,
  } = GlobalStaticConfig.math;
  if (isNumberInputType(type)) {
    if (type === 'number' && !isNumber(value))
      return processStringWithParams(msgs.type, rule) || intl('validation.number.type', rule).d('Must be a number');
    else if (type === 'number-text' && isNaN((value = toNumber(value))))
      return processStringWithParams(msgs.type, rule) || intl('validation.number.type', rule).d('Must be a number');

    if (greaterThan !== undefined && lessThanOrEqual(value, greaterThan))
      return (
        processStringWithParams(msgs.greaterThan, rule) ||
        intl('validation.number.greaterThan', rule).d('Must be greater than ${greaterThan}')
      );
    if (min !== undefined && L(value, min))
      return (
        processStringWithParams(msgs.min, rule) ||
        intl('validation.number.min', rule).d('Must be equal or greater than ${min}')
      );
    if (lessThan !== undefined && greaterThanOrEqual(value, lessThan))
      return (
        processStringWithParams(msgs.lessThan, rule) ||
        intl('validation.number.lessThan', rule).d('Must be less than ${lessThan}')
      );
    if (max !== undefined && G(value, max))
      return (
        processStringWithParams(msgs.max, rule) ||
        intl('validation.number.max', rule).d('Must be equal or less than ${max}')
      );
  }
  // ------------------ number ------------------

  // pattern check and len check ignore type, will convert value to string
  value = String(value);
  if (pattern != null && !toRegExp(pattern).test(value))
    return processStringWithParams(msgs.pattern, rule) || intl('validation.pattern', rule).d('Invalid format');
  if (len != null && value.length !== len)
    return processStringWithParams(msgs.len, rule) || intl('validation.len', rule).d('Must be ${len} characters');
};
