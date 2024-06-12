import { setStyle } from '@lun/utils';

export function useTempInlineStyle(defaultImportant?: boolean) {
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
    function storeAndSetStyle<S extends Partial<CSSStyleDeclaration>>(
      el: Element | undefined | null,
      style: S,
      importantMap: boolean | Record<keyof S, boolean> | undefined = defaultImportant,
    ) {
      const prev = setStyle(el as HTMLElement, style, importantMap);
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
