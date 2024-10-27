import { supportCSSHighLight } from '@lun-web/utils';
import { MaybeRefLikeOrGetter, unrefOrGet } from '../../utils';

export function useCSSHighlight(highlightName: MaybeRefLikeOrGetter<string>) {
  let lastName = '';
  return [
    function set(...ranges: Range[]) {
      const name = unrefOrGet(highlightName);
      if (!supportCSSHighLight || !name || !ranges.length) return;
      lastName = name;
      const highlight = new Highlight(...ranges);
      CSS.highlights.set(name, highlight);
    },
    function remove() {
      if (!supportCSSHighLight || !lastName) return;
      CSS.highlights.delete(lastName);
    },
  ] as const;
}
