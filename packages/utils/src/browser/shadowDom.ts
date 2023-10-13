// copied from shoelace, delete ReturnType of getActiveElements cause ts would report ts(2802) error, no idea why

export function* getActiveElements(activeElement: Element | null = document.activeElement) {
  if (activeElement === null || activeElement === undefined) return;
  yield activeElement;
  if ('shadowRoot' in activeElement && activeElement.shadowRoot && activeElement.shadowRoot.mode !== 'closed') {
    yield* getActiveElements(activeElement.shadowRoot.activeElement);
  }
}

export function getDeepestActiveElement(): Element | null {
  const activeElements = [...getActiveElements()];
  return activeElements[activeElements.length - 1];
}