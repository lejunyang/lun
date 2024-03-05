import { isNumber } from '../is';

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
