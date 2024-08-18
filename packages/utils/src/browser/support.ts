import { cacheFunctionResult } from '../function';
import { isFunction } from '../is';

export const isSupportCSSStyleSheet = cacheFunctionResult(
  () => typeof CSSStyleSheet === 'function' && 'adoptedStyleSheets' in document,
);

export const inBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

export const supportPopover = inBrowser && 'popover' in HTMLElement.prototype;

export const supportDialog = typeof HTMLDialogElement === 'function' && 'open' in HTMLDialogElement.prototype;

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
  return 'showOpenFilePicker' in self && isSecureContext;
});

export const supportClipboard = inBrowser && isSecureContext && navigator.clipboard;

export const isSupportElementInternals = cacheFunctionResult(() => typeof ElementInternals === 'function');

export const isSupportCustomStateSet = cacheFunctionResult(
  // @ts-ignore
  () => isSupportElementInternals() && typeof CustomStateSet === 'function',
);

export const supportCustomElement = typeof customElements === 'object' && customElements;

export const isSupportPlaintextEditable = cacheFunctionResult(() => {
  if (!inBrowser) return false;
  // https://stackoverflow.com/questions/10672081/how-to-detect-if-browser-supports-plaintext-only-value-in-contenteditable-para
  const div = document.createElement('div');
  div.setAttribute('contenteditable', 'PLAINTEXT-ONLY');
  return div.contentEditable === 'plaintext-only';
});

export const isSupportCheckVisibility = cacheFunctionResult(
  () => inBrowser && isFunction(HTMLElement.prototype.checkVisibility),
);

export const supportDocumentPictureInPicture =
  typeof documentPictureInPicture === 'object' &&
  documentPictureInPicture &&
  isFunction(documentPictureInPicture.requestWindow) &&
  isSecureContext;

export const isSupportInert = cacheFunctionResult(() => inBrowser && 'inert' in document.body);

export const supportCSSApi = typeof CSS === 'object' && CSS;

export const supportCSSHighLight =
  supportCSSApi && typeof Highlight === 'function' && typeof CSS.highlights === 'object';

export const supportCSSSupports = supportCSSApi && isFunction(CSS.supports);

export const supportCSSScrollbarGutter = supportCSSSupports && CSS.supports('scrollbar-gutter', 'stable');

export const supportCSSSubgrid = supportCSSSupports && CSS.supports('grid-template-rows', 'subgrid');

// check anchor-name before, change to inset-area because anchor-name is experimental in chromium 117~124, but css anchor position is not fully supported
export const supportCSSAnchor = supportCSSSupports && CSS.supports('inset-area', 'top span-all');

// css layer can not be checked by CSS.supports, but we can use CSSOM to check it
export const supportCSSLayer = typeof CSSLayerBlockRule === 'function';

export const supportCSSDisplayP3 = supportCSSSupports && CSS.supports('color', 'color(display-p3 1 1 1)');
export const supportCSSOklch = supportCSSSupports && CSS.supports('color', 'oklch(1% 1 1)');

export const supportTouch = inBrowser && 'ontouchstart' in document.body;

export const isSupportSlotAssign = cacheFunctionResult(() => isFunction(HTMLSlotElement.prototype.assign));
