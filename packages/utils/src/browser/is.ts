function is(node: unknown, type: 'Node' | 'Element' | 'HTMLElement' | 'HTMLTemplateElement' | 'HTMLImageElement') {
  return (
    globalThis[type] &&
    (node instanceof globalThis[type] ||
      node instanceof ((node as Node)?.ownerDocument?.defaultView || globalThis)[type])
  );
}

export function isNode(node: unknown): node is Node {
  return is(node, 'Node');
}

export function isElement(node: unknown): node is Element {
  return is(node, 'Element');
}

export function isHTMLElement(node: unknown): node is HTMLElement {
  return is(node, 'HTMLElement');
}

export function isHTMLTemplateElement(node: unknown): node is HTMLTemplateElement {
  return is(node, 'HTMLTemplateElement');
}

export function isHTMLImageElement(node: unknown): node is HTMLImageElement {
  return is(node, 'HTMLImageElement');
}
