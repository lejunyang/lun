import { getTypeTag, isNumber } from '../is';
import { getWindow } from './dom';
import { isSupportCSSStyleSheet } from './support';

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
  return isNumber(value) ? `${value}px` : value;
}

/**
 * border-box => get scrollHeight + borderY
 * content-box => get scrollHeight - paddingY
 */
export function getHeight(node: HTMLElement) {
  const styles = getComputedStyle(node);
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
  for (const rule of sheet.cssRules) {
    cloned.insertRule(rule.cssText);
  }
  return cloned;
}

export function copyCSSStyleSheetsIfNeed(sheets: CSSStyleSheet[], currentNode?: Node | Window) {
  const win = getWindow(currentNode);
  return sheets.map((s) => (needCopyCSSStyleSheet(s, currentNode) ? copyCSSStyleSheet(s, win) : s));
}
