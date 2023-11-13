import { cacheFunctionResult } from '../function';

export const isSupportCSSStyleSheet = cacheFunctionResult(
  () => typeof CSSStyleSheet === 'function' && 'adoptedStyleSheets' in document
);

export function isClient() {
  return typeof document !== 'undefined';
}

export const isSupportPopover = cacheFunctionResult(() => isClient() && 'popover' in document.body);

export const isSupportDialog = cacheFunctionResult(
  () => isClient() && typeof HTMLDialogElement !== 'undefined' && 'open' in HTMLDialogElement.prototype
);

export const isSupportResizeObserver = cacheFunctionResult(() => typeof ResizeObserver === 'function');
