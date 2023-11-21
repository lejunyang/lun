import { cacheFunctionResult } from '../function';

export const isSupportCSSStyleSheet = cacheFunctionResult(
  () => typeof CSSStyleSheet === 'function' && 'adoptedStyleSheets' in document
);

export const isClient = cacheFunctionResult(() => typeof window !== 'undefined' && typeof document !== 'undefined');

export const isSupportPopover = cacheFunctionResult(() => isClient() && 'popover' in document.body);

export const isSupportDialog = cacheFunctionResult(
  () => typeof HTMLDialogElement === 'function' && 'open' in HTMLDialogElement.prototype
);

export const isSupportResizeObserver = cacheFunctionResult(() => typeof ResizeObserver === 'function');

export const isInputSupportPicker = cacheFunctionResult(
  () => typeof HTMLInputElement === 'function' && 'showPicker' in HTMLInputElement.prototype
);

// https://github.dev/GoogleChromeLabs/browser-fs-access
export const isSupportFileSystem = cacheFunctionResult(() => {
  if (!isClient()) return;
  // ToDo: Remove this check once Permissions Policy integration
  // has happened, tracked in
  // https://github.com/WICG/file-system-access/issues/245.
  if ('top' in self && self !== top) {
    try {
      // This will succeed on same-origin iframes,
      // but fail on cross-origin iframes.
      // This is longer than necessary, as else the minifier removes it.
      // @ts-ignore
      top.window.document._ = 0;
    } catch {
      return false;
    }
  }
  return 'showOpenFilePicker' in self;
});
