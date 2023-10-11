/*! #__NO_SIDE_EFFECTS__ */
function createGetNodeInTree<T extends Node | Element>({
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
  getNextFromParent: (p) => p.previousElementSibling?.lastElementChild,
});

export const getPreviousMatchNodeInTree = createGetNodeInTree<Node>({
  getNext: (e) => e.previousSibling,
  getParent: (e) => (e as Element).assignedSlot || e.parentNode || (e as ShadowRoot)?.host,
  getNextFromParent: (p) => p.previousSibling?.lastChild,
});

export const getNextMatchElInTree = createGetNodeInTree<Element>({
  getNext: (e) => e.nextElementSibling,
  getParent: (e) => e.assignedSlot || e.parentElement || (e.parentNode as ShadowRoot)?.host,
  getNextFromParent: (p) => p.nextElementSibling?.firstElementChild,
});

export const getNextMatchNodeInTree = createGetNodeInTree<Node>({
  getNext: (e) => e.nextSibling,
  getParent: (e) => (e as Element).assignedSlot || e.parentNode || (e as ShadowRoot)?.host,
  getNextFromParent: (p) => p.nextSibling?.firstChild,
});