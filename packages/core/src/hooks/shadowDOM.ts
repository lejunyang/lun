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
      const sheets = element.shadowRoot?.adoptedStyleSheets;
      if (sheets?.length) {
        elSheetsMap.set(element, [...sheets]); // must shallow copy
      }
      for (const child of element.children) {
        storeAdoptedStyleSheets(child);
      }
    },
    /**
     * Restore the adoptedStyleSheets of the given element and its descendants.\
     * Will check if the element has been moved to another document and copy the CSSStyleSheet objects if necessary.
     */
    function restoreAdoptedStyleSheets(element: Element) {
      const sheets = elSheetsMap.get(element);
      if (sheets && element.shadowRoot) {
        element.shadowRoot.adoptedStyleSheets = copyCSSStyleSheetsIfNeed(sheets, element);
      }
      for (const child of element.children) {
        restoreAdoptedStyleSheets(child);
      }
    },
  ] as const;
}
