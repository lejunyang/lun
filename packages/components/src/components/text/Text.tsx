import { defineSSRCustomElement } from 'custom';
import { createDefineElement, createImportStyle, processStringStyle } from 'utils';
import { textEmits, textProps } from './type';

const name = 'text';
const parts = [] as const;
const ellipsisStyle = `white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`;
export const Text = defineSSRCustomElement({
  name,
  props: textProps,
  emits: textEmits,
  setup(props) {
    return () => {
      const { text = '', ellipsisOffset, ellipsis } = props,
        offset = +ellipsisOffset!;
      if (offset && ellipsis) {
        const style = (
          <style>
            {processStringStyle(`:host([ellipsis]){display:inline-flex}.ellipsis{${ellipsisStyle}flex:1}`, 0, true)}
          </style>
        );
        if (ellipsis === 'end' || ellipsis === true)
          return [style, <span class="ellipsis">{text.slice(0, -offset)}</span>, <span>{text.slice(-offset)}</span>];
        if (ellipsis === 'start')
          return [
            style,
            <span>{text.slice(0, offset)}</span>,
            <span class="ellipsis" style={{ direction: 'rtl' }}>
              {text.slice(offset)}
            </span>,
          ];
      }
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
    `:host([ellipsis]){display:inline-block;${ellipsisStyle}}` +
      `:host([ellipsis=left]){direction:rtl}` +
      `:host([ellipsis=right]){direction:ltr}` +
      `:host([ellipsis=middle]){text-overflow:unset}` +
      // how to have a opposite direction?
      `:host([ellipsis=middle])::before{content:attr(text);float:right;direction:rtl;width:50%;background:inherit;position:relative;background:white;${ellipsisStyle}}`,
  ),
});
