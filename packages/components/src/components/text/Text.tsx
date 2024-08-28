import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
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
      return (
        <>
          {text}
        </>
      );
    };
  },
});

export type tText = typeof Text;
export type iText = InstanceType<tText>;

export const defineText = createDefineElement(name, Text, {}, parts, {});
