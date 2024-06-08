import { hyphenate } from '../string';
import { getTypeTag, isNumber } from '../is';
import { getWindow } from './dom';
import { isElement } from './is';
import { isSupportCSSStyleSheet } from './support';
import { toNumberIfValid } from '../number';

const styleCommentRE = /\/\*[^]*?\*\//g;

export function removeStyleComment(style: string) {
  return style.replace(styleCommentRE, '');
}

export function getValueFromStyle(style: string, key: string) {
  style = removeStyleComment(style);
  const reg = new RegExp(`${key}:\\s*([^;]+);?`);
  const match = style.match(reg);
  return match ? match[1].trim() : '';
}

export function getValuesFromStyle<K extends string[]>(style: string, ...keys: K): Record<K[number], string> {
  style = removeStyleComment(style);
  const result = {} as Record<K[number], string>;
  const reg = new RegExp(`(${keys.join('|')}):\\s*([^;]+);?`, 'g');
  for (const match of style.matchAll(reg)) {
    result[match[1] as K[number]] = match[2].trim();
  }
  return result;
}

export function toPxIfNum(value: string | number | undefined) {
  value = toNumberIfValid(value);
  return isNumber(value) ? `${value}px` : value;
}

/**
 * border-box => get scrollHeight + borderY
 * content-box => get scrollHeight - paddingY
 */
export function getHeight(node: HTMLElement) {
  const styles = getCachedComputedStyle(node);
  // probably node is detached from DOM, can't read computed dimensions
  if (!styles || !styles.boxSizing) return;
  const { paddingTop, paddingBottom, borderTopWidth, borderBottomWidth, boxSizing } = styles;
  const paddingY = parseFloat(paddingTop) + parseFloat(paddingBottom);
  const borderY = parseFloat(borderTopWidth) + parseFloat(borderBottomWidth);
  const { scrollHeight } = node;
  return scrollHeight + (boxSizing === 'border-box' ? borderY : -paddingY);
}

export function isCSSStyleSheet(i: unknown): i is CSSStyleSheet {
  return isSupportCSSStyleSheet() && getTypeTag(i) === 'CSSStyleSheet'; // use getTypeTag to avoid i is a CSSStyleSheet in another window
}

/**
 * determines whether the target style sheet needs to be copied if it's going to be applied to the window of current node
 */
export function needCopyCSSStyleSheet(targetSheet: CSSStyleSheet, currentNode?: Node | Window): boolean {
  return !(targetSheet instanceof getWindow(currentNode).CSSStyleSheet);
}

export function copyCSSStyleSheet(sheet: CSSStyleSheet, defaultWindow?: typeof globalThis | null) {
  const cloned = new (defaultWindow || globalThis).CSSStyleSheet();
  // must pass index to insertRule to keep the order, it defaults to 0
  Array.from(sheet.cssRules).forEach((rule, index) => cloned.insertRule(rule.cssText, index));
  return cloned;
}

export function copyCSSStyleSheetsIfNeed(sheets: CSSStyleSheet[], currentNode?: Node | Window) {
  const win = getWindow(currentNode);
  return sheets.map((s) => (needCopyCSSStyleSheet(s, currentNode) ? copyCSSStyleSheet(s, win) : s));
}

export function setStyle<S extends Partial<CSSStyleDeclaration> | Record<string, string | number | undefined | null>>(
  node: HTMLElement | SVGElement | MathMLElement | null | undefined,
  style: S,
  importantMap?: boolean | Record<keyof S, boolean>,
) {
  if (!isElement(node) || !node.style) return false;
  const prev = {} as Pick<S, keyof S>,
    originalImportantMap = {} as Record<keyof S, boolean>;
  for (const [key, value] of Object.entries(style)) {
    const hk = hyphenate(key);
    // @ts-ignore
    prev[key] = node.style.getPropertyValue(hk); // can not get '--xxx-yy' property through node.style, must use getPropertyValue
    // @ts-ignore
    originalImportantMap[key] = !!node.style.getPropertyPriority(hk);
    node.style.setProperty(
      hk,
      (value as any) ?? '', // value can undefined => "undefined"
      importantMap === true || (importantMap as any)?.[key] ? 'important' : undefined,
    );
  }
  return [prev, originalImportantMap] as const;
}

const computedStyleMap = new WeakMap<Element, CSSStyleDeclaration>();
/**
 * each call of getComputedStyle will return a new object,
 * but it's a live CSS declaration, meaning it'll be updated when the element's style is changed
 */
export function getCachedComputedStyle(el: Element): CSSStyleDeclaration {
  let computedStyle: undefined | CSSStyleDeclaration = computedStyleMap.get(el);
  if (!computedStyle) {
    computedStyle = getComputedStyle(el, null);
    computedStyleMap.set(el, computedStyle);
  }
  return computedStyle;
}
