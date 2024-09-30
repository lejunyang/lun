import { hideDomAndAppend } from './_internal';
import { createElement } from './alias';
import { getCachedComputedStyle } from './style';
import { inBrowser, supportClipboard } from './support';

export const copyText = (() => {
  let textarea: HTMLTextAreaElement;
  return (text: string) => {
    if (!inBrowser) return;
    if (supportClipboard)
      return supportClipboard
        .writeText(text)
        .then(() => true)
        .catch((e) => {
          throw e;
        });
    if (!document.execCommand) return;
    if (!textarea?.isConnected) {
      textarea = createElement('textarea');
      hideDomAndAppend(textarea);
    }
    textarea.value = text;
    textarea.select();
    return document.execCommand('copy');
  };
})();

export const measureTextWidth = (() => {
  let _context: CanvasRenderingContext2D;
  const FONT_KEYS = [
    'fontWeight',
    'fontStyle',
    // 'fontVariant',
    'fontSize',
    'fontFamily',
  ] as const;
  const TEXT_STYLE_KEYS = [
    'letterSpacing',
    'wordSpacing',
    'textTransform',
    'fontVariantCaps',
    'fontKerning',
    'fontStretch',
    'textRendering',
  ] as const;

  function getCanvasContext() {
    if (!_context) {
      _context = createElement('canvas').getContext('2d')!;
    }
    return _context;
  }

  function getCanvasTextStyle(style: CSSStyleDeclaration = getCachedComputedStyle(document.body)) {
    let font = '';
    const textStyle: Partial<{ [key in (typeof TEXT_STYLE_KEYS)[number]]: string | number }> = {};
    FONT_KEYS.forEach((k) => {
      font += ` ${style[k]}`;
    });
    TEXT_STYLE_KEYS.forEach((k) => {
      textStyle[k] = style[k];
    });
    return { ...textStyle, font: font.trim() };
  }
  return (text: string, style?: CSSStyleDeclaration) => {
    let width = 0;
    if (inBrowser) {
      const { tabSize = 8 } = style || getCachedComputedStyle(document.body);
      const tabSpace = ' '.repeat(Number(tabSize));
      const ctx = getCanvasContext();
      Object.assign(ctx, getCanvasTextStyle(style));
      width = ctx.measureText(text.replace(/\t/g, tabSpace)).width;
    }
    return width;
  };
})();
