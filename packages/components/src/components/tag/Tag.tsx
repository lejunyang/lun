import { defineSSRCustomFormElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { tagProps } from './type';
import { defineIcon } from '../icon/Icon';
import { ref } from 'vue';
import { useNamespace } from 'hooks';

const name = 'tag';
export const Tag = defineSSRCustomFormElement({
  name,
  props: tagProps,
  setup(props) {
    const ns = useNamespace(name);
    const closed = ref(false);
    const close = () => (closed.value = true);

    return () => {
      return (
        !closed.value && (
          <span class={ns.themeClass} part="root">
            <slot></slot>
            {props.closable &&
              renderElement('icon', { name: 'x', ...props.closeIconProps, onClick: close, part: 'close' })}
          </span>
        )
      );
    };
  },
});

declare module 'vue' {
  export interface GlobalComponents {
    LTag: typeof Tag;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-tag': typeof Tag;
  }
}

export const defineTag = createDefineElement(name, Tag, {
  icon: defineIcon,
});
