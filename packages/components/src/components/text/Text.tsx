import { defineSSRCustomElement } from 'custom';
import { createDefineElement, createImportStyle } from 'utils';
import { textEmits, textProps } from './type';
import { getCurrentInstance } from 'vue';
import { getCachedComputedStyle } from '@lun/utils';

const name = 'text';
const parts = [] as const;
const ellipsisStyle = `white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`,
  dirReverse: Record<string, string> = { ltr: 'rtl', rtl: 'ltr' };
export const Text = defineSSRCustomElement({
  name,
  props: textProps,
  emits: textEmits,
  setup(props) {
    const { CE } = getCurrentInstance()!,
      styleMap = getCachedComputedStyle(CE);
    return () => {
      const { text = '', ellipsisOffset, ellipsis } = props,
        dir = styleMap.direction,
        offset = +ellipsisOffset!;
      if (offset && ellipsis) {
        if (ellipsis === 'start')
          return [
            <span>{text.slice(0, offset)}</span>,
            // the outer span uses dir-reverse to make the ellipsis appear on the other side, and inner span uses same dir as CE to make text and symbols right
            // if we just use one span, though the ellipsis appear on the other side, the end symbol may be missed
            <span class="ellipsis" dir={dirReverse[dir]}>
              <span dir={dir}>{text.slice(offset)}</span>
            </span>,
          ];
        else if (ellipsis)
          return [<span class="ellipsis">{text.slice(0, -offset)}</span>, <span>{text.slice(-offset)}</span>];
      }
      if (ellipsis === 'start')
        return (
          <span class="ellipsis" dir={dirReverse[dir]}>
            <span dir={dir}>{text}</span>
          </span>
        );
      return text;
    };
  },
});

export type tText = typeof Text;
export type iText = InstanceType<tText>;

export const defineText = createDefineElement(name, Text, {}, parts, {
  // as this is mandatory style for ellipsis, put it in component, not in theme
  common: createImportStyle(
    name,
    `:host(:where([ellipsis]:not([ellipsis=start]))){display:inline-block;${ellipsisStyle}}` +
      `:host([ellipsis=start]),:host([ellipsis-offset]){display:inline-flex;min-width:0}` +
      `.ellipsis{${ellipsisStyle}flex:1}` +
      `:host([ellipsis=middle]){text-overflow:unset}` +
      // how to have a opposite direction?
      `:host([ellipsis=middle])::before{content:attr(text);float:right;direction:rtl;width:50%;background:inherit;position:relative;background:white;${ellipsisStyle}}`,
  ),
});
