import { withResolvers } from '../promise';
import { cacheFunctionByParams } from '../function';
import { isFunction } from '../is';
import { createElement } from './alias';
import { FUNC, hideDomAndAppend, OBJ } from '../_internal';
import { globalObject } from '../get';

const secure = globalObject.isSecureContext,
  getHTMLProto = <K extends '' | 'Dialog' | 'Input' | 'Slot'>(key: K) =>
    (globalObject[`HTML${key}Element`]?.prototype ||
      Object.create(null)) as any as (typeof globalThis)[`HTML${K}Element`]['prototype'],
  htmlProto = getHTMLProto(''),
  dialogProto = getHTMLProto('Dialog'),
  inputProto = getHTMLProto('Input'),
  slotProto = getHTMLProto('Slot');

export const inBrowser = 'style' in htmlProto;

export const supportPopover = 'popover' in htmlProto;

export const supportDialog = 'open' in dialogProto;

export const isSupportResizeObserver = cacheFunctionByParams(() => typeof ResizeObserver === FUNC);

export const isInputSupportPicker = cacheFunctionByParams(() => 'showPicker' in inputProto);

// https://github.dev/GoogleChromeLabs/browser-fs-access
export const supportFileSystemAccess = (() => {
  if (!secure) return false;
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
})();

export const supportClipboard = secure && navigator.clipboard;

export const isSupportElementInternals = cacheFunctionByParams(() => typeof ElementInternals === FUNC);

export const isSupportCustomStateSet = cacheFunctionByParams(
  // @ts-ignore
  () => isSupportElementInternals() && typeof CustomStateSet === FUNC,
);

export const isSupportScrollEnd = cacheFunctionByParams(() => inBrowser && 'onscrollend' in htmlProto);

export const supportCustomElement = typeof customElements === OBJ && customElements;

export const isSupportPlaintextEditable = cacheFunctionByParams(() => {
  if (!inBrowser) return false;
  // https://stackoverflow.com/questions/10672081/how-to-detect-if-browser-supports-plaintext-only-value-in-contenteditable-para
  const div = createElement('div', { contenteditable: 'PLAINTEXT-ONLY' });
  return div.contentEditable === 'plaintext-only';
});

export const isSupportCheckVisibility = cacheFunctionByParams(() => isFunction(htmlProto.checkVisibility));

export const supportDocumentPictureInPicture =
  secure &&
  typeof documentPictureInPicture === OBJ &&
  documentPictureInPicture &&
  isFunction(documentPictureInPicture.requestWindow);

export const isSupportInert = cacheFunctionByParams(() => inBrowser && 'inert' in htmlProto);

export const supportCSSApi = typeof CSS === OBJ && CSS;

export const isSupportCSSStyleSheet = cacheFunctionByParams(
  () => typeof CSSStyleSheet === FUNC && 'adoptedStyleSheets' in document,
);

export const supportCSSHighLight = supportCSSApi && typeof Highlight === FUNC && typeof CSS.highlights === OBJ;

let supports: typeof CSS.supports;
export const supportCSSSupports = supportCSSApi && isFunction((supports = CSS.supports));

export const supportCSSScrollbarGutter = supportCSSSupports && supports!('scrollbar-gutter', 'stable');

const gridRows = 'grid-template-rows';
export const supportCSSSubgrid = supportCSSSupports && supports!(gridRows, 'subgrid');

// was checking anchor-name before, changed to inset-area because although anchor-name is experimental in chromium 117~124, but css anchor position is not fully supported
// renamed to position-area
export const supportCSSAnchor =
  supportCSSSupports && (supports!('position-area', 'top span-all') || supports!('inset-area', 'top span-all'));

export const supportCSSAutoHeightTransition = supportCSSSupports && supports!('height', 'calc-size(auto,size)');

let gridAnimationResult: boolean | Promise<boolean>, gridChecked: boolean | undefined;
export const isSupportCSSGridTrackAnimation = () => {
  if (gridChecked) return gridAnimationResult;
  if (!inBrowser) return false;
  gridChecked = true;
  const grid = createElement('div', { innerHTML: '<div>1</div>' });
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
export const supportCSSLayer = typeof CSSLayerBlockRule === FUNC;
export const supportCSSScope = typeof CSSScopeRule === FUNC;
export const supportCSSContainer = typeof CSSContainerRule === FUNC;

export const supportCSSDisplayP3 = supportCSSSupports && supports!('color', 'color(display-p3 1 1 1)');
export const supportCSSOklch = supportCSSSupports && supports!('color', 'oklch(1% 1 1)');

export const supportCSSRegisterProperty = supportCSSSupports && CSS.registerProperty;

export const supportCSSContentVisibility = supportCSSSupports && supports!('content-visibility', 'hidden');

export const supportTouch = 'ontouchstart' in htmlProto;

export const isSupportSlotAssign = cacheFunctionByParams(() => isFunction(slotProto.assign));
