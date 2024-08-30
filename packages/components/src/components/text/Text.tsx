import { defineSSRCustomElement } from 'custom';
import { createDefineElement, createImportStyle } from 'utils';
import { textEmits, textProps } from './type';
import { getCurrentInstance } from 'vue';
import { getCachedComputedStyle } from '@lun/utils';
import { getCompParts } from 'common';

const name = 'text';
const parts = ['ellipsis', 'inner', 'offset'] as const;
const compParts = getCompParts(name, parts);
const hidden = 'overflow:hidden;',
  ellipsisStyle = hidden + `white-space:nowrap;text-overflow:ellipsis;`,
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
      const getReverse = (text: string, cls?: any) => {
        return (
          <span class={['ellipsis', cls]} dir={dirReverse[dir]} part={compParts[0]}>
            <span dir={dir} part={compParts[1]}>
              {text}
            </span>
          </span>
        );
      };

      if (ellipsis === 'start') {
        if (offset)
          return [
            <span part={compParts[2]}>{text.slice(0, offset)}</span>,
            // the outer span uses dir-reverse to make the ellipsis appear on the other side, and inner span uses same dir as CE to make text and symbols right
            // if we just use one span, though the ellipsis appear on the other side, the end symbol may be missed
            getReverse(text.slice(offset)),
          ];
        return getReverse(text);
      } else if (ellipsis === 'center')
        return [
          dir === 'ltr' ? (
            getReverse(text, `float`)
          ) : (
            <span class="ellipsis float" part={compParts[0]}>
              {text}
            </span>
          ),
          text,
        ];
      else if (ellipsis && offset)
        return [
          <span class="ellipsis" part={compParts[0]}>
            {text.slice(0, -offset)}
          </span>,
          <span part={compParts[2]}>{text.slice(-offset)}</span>,
        ];
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
    `:host([ellipsis]){display:inline-block}` +
      `:host(:where([ellipsis]:not([ellipsis=start],[ellipsis=center]))){${ellipsisStyle}}` +
      `:host([ellipsis=center]){height:1.5em;line-height:1.5;${hidden}}` +
      `:host([ellipsis=start]),:host([ellipsis-offset]){display:inline-flex;min-width:0}` +
      `.ellipsis{${ellipsisStyle}flex:1}` +
      `.float{float:right;width:50%;}`,
  ),
});
