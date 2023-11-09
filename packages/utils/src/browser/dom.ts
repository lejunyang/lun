/*! #__NO_SIDE_EFFECTS__ */
export function createGetNodeInTree<T extends Node | Element>({
  getNext,
  getParent,
  getNextFromParent,
}: {
  getNext: (i: T) => T | null | undefined;
  getParent: (i: T) => T | null | undefined;
  getNextFromParent: (p: T) => T | null | undefined;
}) {
  return function (el?: T | null, options?: { isMatch?: (el: T) => boolean; shouldStop?: (el: T) => boolean }) {
    if (!el) return null;
    let isMatch = options?.isMatch || ((el) => !!el);
    let shouldStop = options?.shouldStop || ((el) => el.parentElement === document.documentElement);
    let temp = el;
    while (true) {
      const next = getNext(temp);
      if (next) {
        if (isMatch(next)) return next;
        else temp = next;
      } else {
        const parent = getParent(temp);
        if (!parent || shouldStop(parent)) return null;
        else if (isMatch(parent)) return parent;
        else {
          const nextFromParent = getNextFromParent(parent);
          if (!nextFromParent) temp = parent;
          else if (isMatch(nextFromParent)) return nextFromParent;
          else temp = nextFromParent;
        }
      }
    }
  };
}

export const getPreviousMatchElInTree = createGetNodeInTree<Element>({
  getNext: (e) => e.previousElementSibling,
  getParent: (e) => e.assignedSlot || e.parentElement || (e.parentNode as ShadowRoot)?.host,
  getNextFromParent: (p) => {
    const prevEl = p.previousElementSibling;
    if (!prevEl) return;
    // will try to access shadowRoot, but not deeply iterate, useful for root element in shadow dom
    if (prevEl.shadowRoot) return prevEl.shadowRoot.lastElementChild;
    return prevEl.lastElementChild;
  },
});

export const getPreviousMatchNodeInTree = createGetNodeInTree<Node>({
  getNext: (e) => e.previousSibling,
  getParent: (e) => (e as Element).assignedSlot || e.parentNode || (e as ShadowRoot)?.host,
  getNextFromParent: (p) => {
    const prevEl = p.previousSibling;
    if (!prevEl) return;
    const { shadowRoot } = prevEl as Element;
    if (shadowRoot) return shadowRoot.lastChild;
    return prevEl.lastChild;
  },
});

export const getNextMatchElInTree = createGetNodeInTree<Element>({
  getNext: (e) => e.nextElementSibling,
  getParent: (e) => e.assignedSlot || e.parentElement || (e.parentNode as ShadowRoot)?.host,
  getNextFromParent: (p) => {
    const nextEl = p.nextElementSibling;
    if (!nextEl) return;
    if (nextEl.shadowRoot) return nextEl.shadowRoot.firstElementChild;
    return nextEl.firstElementChild;
  },
});

export const getNextMatchNodeInTree = createGetNodeInTree<Node>({
  getNext: (e) => e.nextSibling,
  getParent: (e) => (e as Element).assignedSlot || e.parentNode || (e as ShadowRoot)?.host,
  getNextFromParent: (p) => {
    const nextEl = p.nextSibling;
    if (!nextEl) return;
    const { shadowRoot } = nextEl as Element;
    if (shadowRoot) return shadowRoot.firstChild;
    return nextEl.firstChild;
  },
});
