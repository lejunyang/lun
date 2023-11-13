function is(node: Node, type: 'Element' | 'HTMLElement' | 'HTMLTemplateElement') {
  return node instanceof globalThis[type] || node instanceof node.ownerDocument.defaultView[type];
}

export function isElement(node: Node): node is Element {
  return is(node, 'Element');
}

export function isHTMLElement(node: Node): node is HTMLElement {
  return is(node, 'HTMLElement');
}

export function isHTMLTemplateElement(node: Node): node is HTMLTemplateElement {
  return is(node, 'HTMLTemplateElement');
}