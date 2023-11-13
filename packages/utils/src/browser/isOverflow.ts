import { measureTextWidth } from './measureTextWidth';

export function getContentWidth(element: HTMLElement, computedStyle: CSSStyleDeclaration): number {
  const { width, boxSizing } = computedStyle;
  if (boxSizing === 'content-box' && width && width !== 'auto') {
    return parseFloat(width);
  }
  const contentWidth = width && width !== 'auto' ? parseFloat(width) : element.offsetWidth;
  const { paddingLeft, paddingRight, borderLeftWidth, borderRightWidth } = computedStyle;
  const pl = paddingLeft ? parseFloat(paddingLeft) : 0;
  const pr = paddingRight ? parseFloat(paddingRight) : 0;
  const bl = borderLeftWidth ? parseFloat(borderLeftWidth) : 0;
  const br = borderRightWidth ? parseFloat(borderRightWidth) : 0;
  return contentWidth - pl - pr - bl - br;
}

export function isOverflow(
  element: HTMLElement,
  options?: { getText?: (el: HTMLElement) => string; trim?: boolean; measure?: boolean }
) {
  const { getText, trim = true, measure = true } = options || {};
  const { innerText, ownerDocument } = element; // use innerText, textContent will get all text including hidden text(display: none, popover, etc.)
  // but sometimes we need to specify text, i.e. popover, when it's show, text of pop content will be included in innerText
  let text = getText ? getText(element) : innerText;
  if (trim) text = text.trim();
  const { value } = element as HTMLInputElement;
  if ((value || text) && ownerDocument) {
    const { clientWidth, scrollWidth } = element;
    if (scrollWidth > clientWidth) return true;
    const { defaultView } = ownerDocument;
    if (measure && defaultView) {
      const computedStyle = defaultView.getComputedStyle(element);
      const contentWidth = Math.round(getContentWidth(element, computedStyle));
      const textWidth = Math.round(measureTextWidth(text || value, computedStyle));
      const { whiteSpace } = computedStyle;
      const isNoWrap = whiteSpace === 'nowrap';
      return textWidth > contentWidth && isNoWrap;
    }
  }
  return false;
}
