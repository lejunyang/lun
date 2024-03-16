import { cacheFunctionResult } from '../function';

export const isSupportCSSStyleSheet = cacheFunctionResult(
  () => typeof CSSStyleSheet === 'function' && 'adoptedStyleSheets' in document,
);

export const inBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

export const isSupportPopover = cacheFunctionResult(() => inBrowser && 'popover' in document.body);

export const isSupportDialog = cacheFunctionResult(
  () => typeof HTMLDialogElement === 'function' && 'open' in HTMLDialogElement.prototype,
);

export const isSupportResizeObserver = cacheFunctionResult(() => typeof ResizeObserver === 'function');

export const isInputSupportPicker = cacheFunctionResult(
  () => typeof HTMLInputElement === 'function' && 'showPicker' in HTMLInputElement.prototype,
);

// https://github.dev/GoogleChromeLabs/browser-fs-access
export const isSupportFileSystem = cacheFunctionResult(() => {
  if (!inBrowser) return;
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

export const isSupportElementInternals = cacheFunctionResult(() => typeof ElementInternals === 'function');

export const isSupportCustomStateSet = cacheFunctionResult(
  // @ts-ignore
  () => isSupportElementInternals() && typeof CustomStateSet === 'function',
);

export const supportCustomElement = typeof customElements === 'object' && customElements;

export const supportsPlaintextEditable = cacheFunctionResult(() => {
  if (!inBrowser) return false;
  // https://stackoverflow.com/questions/10672081/how-to-detect-if-browser-supports-plaintext-only-value-in-contenteditable-para
  const div = document.createElement('div');
  div.setAttribute('contenteditable', 'PLAINTEXT-ONLY');
  return div.contentEditable === 'plaintext-only';
});
