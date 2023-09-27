import { cacheFunctionResult } from '../function';
import { isFunction } from '../is';

export const supportCSSStyleSheet = cacheFunctionResult(
  () => isFunction(CSSStyleSheet) && 'adoptedStyleSheets' in document
);
