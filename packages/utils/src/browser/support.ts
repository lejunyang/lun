import { withResolvers } from '../promise';
import { cacheFunctionResult } from '../function';
import { isFunction } from '../is';
import { hideDomAndAppend } from './_internal';

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
export const isSupportFileSystemAccess = cacheFunctionResult(() => {
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

export const isSupportScrollEnd = cacheFunctionResult(() => inBrowser && 'onscrollend' in document);

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

let supports: typeof CSS.supports;
export const supportCSSSupports = supportCSSApi && isFunction((supports = CSS.supports));

export const supportCSSScrollbarGutter = supportCSSSupports && supports!('scrollbar-gutter', 'stable');

const gridRows = 'grid-template-rows';
export const supportCSSSubgrid = supportCSSSupports && supports!(gridRows, 'subgrid');

// was checking anchor-name before, changed to inset-area because although anchor-name is experimental in chromium 117~124, but css anchor position is not fully supported
// renamed to position-area
export const supportCSSAnchor =
  supportCSSSupports && (supports!('position-area', 'top span-all') || supports!('inset-area', 'top span-all'));

export const supportCSSAutoHeightTransition = supportCSSSupports && supports!('height', 'calc-size(auto)');

let gridAnimationResult: boolean | Promise<boolean>, gridChecked: boolean | undefined;
export const isSupportCSSGridTrackAnimation = () => {
  if (gridChecked) return gridAnimationResult;
  if (!inBrowser) return false;
  gridChecked = true;
  const grid = document.createElement('div'),
    inner = document.createElement('div');
  inner.innerText = '1';
  grid.append(inner);
  const [promise, resolve] = withResolvers<boolean>();
  let failTimer: any;
  grid.ontransitionstart = (e: TransitionEvent) => {
    if (e.propertyName === gridRows) {
      clearTimeout(failTimer);
      resolve((gridAnimationResult = true));
      grid.remove();
    }
  };
  hideDomAndAppend(grid, `display:grid;${gridRows}:0fr;transition:${gridRows} 1ms;`);
  grid.offsetHeight; // trigger reflow, or setting style right after appending DOM cannot trigger transition start
  // ontransitionstart requires about 10~20ms to be triggered after setting style, use 50ms to timeout
  failTimer = setTimeout(() => {
    resolve((gridAnimationResult = false));
    grid.remove();
  }, 50);
  grid.style.setProperty(gridRows, '1fr');
  return (gridAnimationResult = promise);
};

// css layer can not be checked by CSS.supports, but we can use CSSOM to check it
export const supportCSSLayer = typeof CSSLayerBlockRule === 'function';

export const supportCSSDisplayP3 = supportCSSSupports && supports!('color', 'color(display-p3 1 1 1)');
export const supportCSSOklch = supportCSSSupports && supports!('color', 'oklch(1% 1 1)');

export const supportCSSRegisterProperty = supportCSSSupports && CSS.registerProperty;

export const supportTouch = inBrowser && 'ontouchstart' in document.body;

export const isSupportSlotAssign = cacheFunctionResult(() => isFunction(HTMLSlotElement.prototype.assign));
