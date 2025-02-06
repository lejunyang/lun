import { watchEffect } from 'vue';
import { MaybeRefLikeOrGetter, unrefOrGet } from '../utils';
import { setStyle } from '@lun-web/utils';

export function useInlineStyle(
  elGetter: MaybeRefLikeOrGetter<HTMLElement | SVGElement | MathMLElement>,
  styleGetter: MaybeRefLikeOrGetter<string | Partial<CSSStyleDeclaration>>,
): void {
  watchEffect(() => {
    setStyle(unrefOrGet(elGetter), unrefOrGet(styleGetter) as any);
  });
}
