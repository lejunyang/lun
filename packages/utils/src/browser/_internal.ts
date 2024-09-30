export function hideDomAndAppend(dom: HTMLElement, cssText = '') {
  dom.ariaHidden = 'true';
  dom.style.cssText = 'position:fixed;top:-100px;left:-100px;pointer-events:none;opacity:0;' + cssText;
  document.body.append(dom);
}
