import { isHTMLElement, isShadowRoot, isNode } from './is';
import { at } from '../array';

// derived from shoelace
export function* getActiveElements(activeElement: Element | null = document.activeElement): Generator<Element> {
  if (activeElement == null) return;
  yield activeElement;
  if (activeElement.shadowRoot) {
    yield* getActiveElements(activeElement.shadowRoot.activeElement);
  }
}

export function getDeepestActiveElement() {
  return at([...getActiveElements()], -1) as HTMLElement | undefined;
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
 * determine if an element contains target, or if its shadow dom contains target
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

export function toHostIfSlot(node: any) {
  return (isNode(node) && (node.getRootNode() as ShadowRoot)?.host) || node;
}
