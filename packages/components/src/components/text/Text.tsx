import { defineSSRCustomElement } from 'custom';
import { createDefineElement, createImportStyle } from 'utils';
import { textEmits, textProps } from './type';

const name = 'text';
const parts = [] as const;
export const Text = defineSSRCustomElement({
  name,
  props: textProps,
  emits: textEmits,
  setup(props) {
    return () => {
      const { text } = props;
      return text;
    };
  },
});

export type tText = typeof Text;
export type iText = InstanceType<tText>;

const ellipsisStyle = `white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`;
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
