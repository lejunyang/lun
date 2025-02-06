import { setStyle } from './browser';

export const FUNC = 'function',
  OBJ = 'object',
  NUM = 'number',
  STR = 'string',
  UNDEF = 'undefined';
export const defaultProperties = {
  enumerable: true,
  configurable: true,
};
export function hideDomAndAppend(dom: HTMLElement, cssText = '') {
  dom.ariaHidden = 'true';
  setStyle(dom, 'position:fixed;top:-100px;left:-100px;pointer-events:none;opacity:0;' + cssText);
  document.body.append(dom);
}
