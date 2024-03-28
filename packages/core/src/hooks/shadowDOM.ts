import { copyCSSStyleSheetsIfNeed } from '@lun/utils';

/**
 * This hook provides two functions to store and restore the adoptedStyleSheets of an element and its descendants.\
 * It is useful when you want to move an element to another document and make its adoptedStyleSheets still take effect.
 * @returns An array of two functions: storeAdoptedStyleSheets and restoreAdoptedStyleSheets.
 */
export function useAdoptedSheetsSnapshot() {
  const elSheetsMap = new WeakMap<Element, CSSStyleSheet[]>();
  return [
    /**
     * Store the adoptedStyleSheets of the given element and its descendants.
     */
    function storeAdoptedStyleSheets(element: Element) {
      const { shadowRoot, children } = element;
      if (shadowRoot) {
        const sheets = [...shadowRoot.adoptedStyleSheets]; // must shallow copy
        if (sheets.length) {
          elSheetsMap.set(element, [...sheets]);
        }
        // need to process the shadowRoot's children too... as there may be some custom elements too
        for (const child of shadowRoot.children) {
          storeAdoptedStyleSheets(child);
        }
      }
      for (const child of children) {
        storeAdoptedStyleSheets(child);
      }
    },
    /**
     * Restore the adoptedStyleSheets of the given element and its descendants.\
     * Will check if the element has been moved to another document and copy the CSSStyleSheet objects if necessary.
     */
    function restoreAdoptedStyleSheets(element: Element) {
      const { shadowRoot, children } = element;
      const sheets = elSheetsMap.get(element);
      if (shadowRoot) {
        if (sheets) shadowRoot.adoptedStyleSheets = copyCSSStyleSheetsIfNeed(sheets, element);
        for (const child of shadowRoot.children) {
          restoreAdoptedStyleSheets(child);
        }
      }
      for (const child of children) {
        restoreAdoptedStyleSheets(child);
      }
    },
  ] as const;
}
