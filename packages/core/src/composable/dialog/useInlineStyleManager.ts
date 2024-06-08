import { setStyle } from '@lun/utils';

export function useInlineStyleManager() {
  const elStyleMap = new WeakMap<
    Element,
    readonly [Partial<CSSStyleDeclaration>, Record<keyof CSSStyleDeclaration, boolean>]
  >();
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
      const original = elStyleMap.get(el!);
      if (original) setStyle(el as HTMLElement, original[0], original[1]);
    },
  ] as const;
}
