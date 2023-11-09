// copied from shoelace, no idea why ts would report ts(2802) error in vscode, but build successfully

export function* getActiveElements(activeElement: Element | null = document.activeElement): Generator<Element> {
  if (activeElement === null || activeElement === undefined) return;
  yield activeElement;
  if ('shadowRoot' in activeElement && activeElement.shadowRoot && activeElement.shadowRoot.mode !== 'closed') {
    // @ts-ignore
    yield* getActiveElements(activeElement.shadowRoot.activeElement);
  }
}

export function getDeepestActiveElement(): Element | null {
  // @ts-ignore
  const activeElements = [...getActiveElements()];
  return activeElements[activeElements.length - 1];
}