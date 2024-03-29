import { inBrowser } from './support';

export const copyText = (() => {
  let textarea: HTMLTextAreaElement;
  return (text: string) => {
    if (!inBrowser) return;
    try {
      if (typeof navigator?.clipboard?.writeText === 'function') return navigator.clipboard.writeText(text);
    } catch {}
    if (!document.execCommand) return;
    if (!textarea || !textarea.isConnected) {
      textarea = document.createElement('textarea');
      textarea.style.cssText = 'position:fixed;top:-100px;left:-100px;pointer-events:none;opacity:0;';
      document.body.appendChild(textarea);
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
      _context = document.createElement('canvas').getContext('2d')!;
    }
    return _context;
  }

  function getCanvasTextStyle(style: CSSStyleDeclaration = getComputedStyle(document.body)) {
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
    if (typeof window !== undefined) {
      const { tabSize = 8 } = style || getComputedStyle(document.body);
      const tabSpace = ' '.repeat(Number(tabSize));
      const ctx = getCanvasContext();
      Object.assign(ctx, getCanvasTextStyle(style));
      width = ctx.measureText(text.replace(/\t/g, tabSpace)).width;
    }
    return width;
  };
})();
