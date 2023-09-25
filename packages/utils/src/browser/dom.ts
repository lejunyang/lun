export function getPreviousMatchElInTree(
  el?: Element | null,
  options?: { isMatch?: (el: Element) => boolean; needStop?: (el: Element) => boolean }
) {
  if (!el) return null;
  let isMatch = options?.isMatch || ((el) => !!el);
  let needStop = options?.needStop || ((el) => el.parentElement === document.documentElement);
  let temp = el;
  while (true) {
    if (temp.previousElementSibling) {
      if (isMatch(temp.previousElementSibling)) return temp.previousElementSibling;
      else temp = temp.previousElementSibling;
    } else {
      const parent = temp.parentElement || (temp.parentNode as ShadowRoot)?.host;
      if (!parent || needStop(parent)) return null;
      else if (isMatch(parent)) return parent;
      else {
        const siblingLastChild = parent.previousElementSibling?.lastElementChild;
        if (!siblingLastChild) temp = parent;
        else if (isMatch(siblingLastChild)) return siblingLastChild;
        else temp = siblingLastChild;
      }
    }
  }
}

export function getPreviousMatchNodeInTree(
  node?: Node | null,
  options?: { isMatch?: (node: Node) => boolean; needStop?: (node: Node) => boolean }
) {
  if (!node) return null;
  let isMatch = options?.isMatch || ((node) => !!node);
  let needStop = options?.needStop || ((node) => node.parentNode === document.documentElement);
  let temp = node;
  while (true) {
    if (temp.previousSibling) {
      if (isMatch(temp.previousSibling)) return temp.previousSibling;
      else temp = temp.previousSibling;
    } else {
      const parent = temp.parentNode || (temp as ShadowRoot).host;
      if (!parent || needStop(parent)) return null;
      else if (isMatch(parent)) return parent;
      else {
        const siblingLastChild = parent.previousSibling?.lastChild;
        if (!siblingLastChild) temp = parent;
        else if (isMatch(siblingLastChild)) return siblingLastChild;
        else temp = siblingLastChild;
      }
    }
  }
}
