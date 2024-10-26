export function getWindow(nodeOrWindow?: Node | Window) {
  return (nodeOrWindow as Window)?.window || (nodeOrWindow as Node)?.ownerDocument?.defaultView || window;
}

export function getDocumentElement(nodeOrWindow?: Node | Window) {
  return getWindow(nodeOrWindow).document.documentElement;
}
