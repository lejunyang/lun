import { cacheFunctionResult } from '../function';

export const supportCSSStyleSheet = cacheFunctionResult(
  () => typeof CSSStyleSheet === 'function' && 'adoptedStyleSheets' in document
);
