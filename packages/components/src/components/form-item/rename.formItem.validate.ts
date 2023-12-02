import { GlobalStaticConfig } from '../config';
import { Validator } from './type';
import { intl } from 'common';

export const innerValidator: Validator = (value, _, rule) => {
  const { min, max, greaterThan, lessThan, required } = rule;
  if (value == null) return required ? intl('validation.required', rule) : undefined;
  const { greaterThan: G, lessThan: L, greaterThanOrEqual, lessThanOrEqual } = GlobalStaticConfig.math;
  if (greaterThan !== undefined && lessThanOrEqual(value, greaterThan))
    return intl('validation.number.greaterThan', rule);
  if (min !== undefined && L(value, min)) return intl('validation.number.min', rule);
  if (lessThan !== undefined && greaterThanOrEqual(value, lessThan)) return intl('validation.number.lessThan', rule);
  if (max !== undefined && G(value, max)) return intl('validation.number.max', rule);
};
