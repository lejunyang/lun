import { GlobalStaticConfig } from '../config';
import { Rule, ValidateMessages } from './type';
import { intl, processStringWithParams } from 'common';

export const innerValidator = (value: any, _data: any, rule: Rule, msgs: ValidateMessages) => {
  const { min, max, greaterThan, lessThan, required } = rule;
  if (value == null)
    return required
      ? processStringWithParams(msgs.required, rule) ||
          intl('validation.required', rule).d(({ label }: any) => `Please enter ${label || 'this field'}`)
      : undefined;
  const { greaterThan: G, lessThan: L, greaterThanOrEqual, lessThanOrEqual } = GlobalStaticConfig.math;
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
};
