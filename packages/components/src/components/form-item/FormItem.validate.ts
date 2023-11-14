import { GlobalStaticConfig } from '../config';
import { Validator } from './type';
import { intl } from 'common';

export const innerValidator: Validator = (value, _, rule) => {
  const { min, max, greaterThan, lessThan, required } = rule;
  if (value == null) return required ? intl('validation.required', rule) : undefined;
  const { greaterThan: G, lessThan: L, equals } = GlobalStaticConfig.math;
  if (greaterThan !== undefined && (L(value, greaterThan) || equals(value, greaterThan)))
    return intl('validation.greaterThan', rule);
  if (min !== undefined && L(value, min)) return intl('validation.min', rule);
  if (lessThan !== undefined && (G(value, lessThan) || equals(value, lessThan)))
    return intl('validation.lessThan', rule);
  if (max !== undefined && G(value, max)) return intl('validation.max', rule);
};
