import { isHTMLElement, isShadowRoot, isNode } from './is';

// copied from shoelace, no idea why ts would report ts(2802) error in vscode, but build successfully
export function* getActiveElements(activeElement: Element | null = document.activeElement): Generator<Element> {
  if (activeElement === null || activeElement === undefined) return;
  yield activeElement;
  if ('shadowRoot' in activeElement && activeElement.shadowRoot && activeElement.shadowRoot.mode !== 'closed') {
    // @ts-ignore
    yield* getActiveElements(activeElement.shadowRoot.activeElement);
  }
}

export function getDeepestActiveElement() {
  // @ts-ignore
  const activeElements = [...getActiveElements()];
  return activeElements[activeElements.length - 1] as HTMLElement | undefined;
}

export function getInnerTextOfSlot(slotEl?: HTMLSlotElement) {
  if (!slotEl) return '';
  return slotEl.assignedNodes({ flatten: true }).reduce((acc, node) => {
    if (isHTMLElement(node)) return acc + node.innerText;
    const { nodeType, textContent } = node;
    return acc + (nodeType === Node.TEXT_NODE ? textContent : '');
  }, '');
}

/**
 * judge if an element contains target, or if its shadow dom contains target
 */
export function shadowContains(el?: Element | null, target?: Element | null) {
  if (!el || !target) return false;
  if (el.contains(target)) return true;
  const { shadowRoot } = el;
  if (shadowRoot) return shadowRoot.contains(target);
  return false;
}

export function isInShadowRoot(node?: Node) {
  return isNode(node) && isShadowRoot(node.getRootNode());
}