/*! #__NO_SIDE_EFFECTS__ */
export function createGetNodeInTree<T extends Node | Element>({
  getNext,
  getParent,
}: {
  getNext: (i: T) => T | null | undefined;
  getParent: (i: T) => T | null | undefined;
}) {
  return function (
    el?: T | null,
    options?: { isMatch?: (el: T, current: T) => boolean; shouldStop?: (el: T) => boolean },
  ) {
    if (!el) return null;
    let isMatch = options?.isMatch || ((el) => !!el);
    let shouldStop = options?.shouldStop || ((el) => el.parentElement === document.documentElement);
    let temp = el;
    while (true) {
      const next = getNext(temp);
      if (next) {
        if (isMatch(next, temp)) return next;
        else temp = next;
      } else {
        const parent = getParent(temp);
        if (!parent || shouldStop(parent)) return null;
        else if (isMatch(parent, temp)) return parent;
        else {
          const nextFromParent = getNext(parent);
          if (!nextFromParent) temp = parent;
          else if (isMatch(nextFromParent, temp)) return nextFromParent;
          else temp = nextFromParent;
        }
      }
    }
  };
}

export const getPreviousMatchElInTree = createGetNodeInTree<Element>({
  getNext: (e) => {
    const pes = e.previousElementSibling;
    if (!pes) return;
    // will try to access shadowRoot and child, but not deeply iterate, useful for root element in shadow dom
    return pes.shadowRoot?.lastElementChild || pes.lastElementChild || pes;
  },
  getParent: (e) => e.assignedSlot || e.parentElement || (e.parentNode as ShadowRoot)?.host,
});

export const getPreviousMatchNodeInTree = createGetNodeInTree<Node>({
  getNext: (e) => {
    const ps = e.previousSibling;
    if (!ps) return;
    return (ps as Element).shadowRoot?.lastChild || ps.lastChild || ps;
  },
  getParent: (e) => (e as Element).assignedSlot || e.parentNode || (e as ShadowRoot)?.host,
});

export const getNextMatchElInTree = createGetNodeInTree<Element>({
  getNext: (e) => {
    const nes = e.nextElementSibling;
    if (!nes) return;
    return nes.shadowRoot?.firstElementChild || nes.firstElementChild || nes;
  },
  getParent: (e) => e.assignedSlot || e.parentElement || (e.parentNode as ShadowRoot)?.host,
});

export const getNextMatchNodeInTree = createGetNodeInTree<Node>({
  getNext: (e) => {
    const ns = e.nextSibling;
    if (!ns) return;
    return (ns as Element).shadowRoot?.firstChild || ns.firstChild || ns;
  },
  getParent: (e) => (e as Element).assignedSlot || e.parentNode || (e as ShadowRoot)?.host,
});

export function getWindow(nodeOrWindow?: Node | Window) {
  return (nodeOrWindow as Window)?.window || (nodeOrWindow as Node)?.ownerDocument?.defaultView || window;
}
