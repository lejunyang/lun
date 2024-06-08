import { setStyle } from '@lun/utils';

export function useInlineStyleManager() {
  const elStyleMap = new WeakMap<Element, Partial<CSSStyleDeclaration>>();
  return [
    /**
     * storeAndSetStyle
     * @param el
     * @param style
     */
    function storeAndSetStyle<S extends Partial<CSSStyleDeclaration>>(el: Element | undefined | null, style: S) {
      const prev = setStyle(el as HTMLElement, style, true);
      if (prev) elStyleMap.set(el!, prev);
      return prev;
    },
    /**
     * restoreElStyle
     * @param el
     */
    function restoreElStyle(el: Element | undefined | null) {
      const style = elStyleMap.get(el!);
      if (style) Object.assign((el as HTMLElement).style, style);
    },
  ] as const;
}
