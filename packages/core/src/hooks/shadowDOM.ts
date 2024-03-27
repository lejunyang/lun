import { cloneCSSStyleSheets } from '@lun/utils';

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
      const sheets = element.shadowRoot?.adoptedStyleSheets;
      if (sheets) {
        elSheetsMap.set(element, [...sheets]); // must shallow copy
      }
      for (const child of element.children) {
        storeAdoptedStyleSheets(child);
      }
    },
    /**
     * Restore the adoptedStyleSheets of the given element and its descendants.
     * @param copy Whether to clone the CSSStyleSheet objects. Defaults to false. If the element has been moved to another document, it must be true to make the styles take effect.
     */
    function restoreAdoptedStyleSheets(element: Element, copy?: boolean) {
      const sheets = elSheetsMap.get(element);
      if (sheets && element.shadowRoot) {
        element.shadowRoot.adoptedStyleSheets = copy
          ? // must use target's window, or the new styleSheet may not take effect if the element has been moved to another document
            cloneCSSStyleSheets(sheets, element.ownerDocument.defaultView || window)
          : sheets;
      }
      for (const child of element.children) {
        restoreAdoptedStyleSheets(child);
      }
    },
  ] as const;
}
