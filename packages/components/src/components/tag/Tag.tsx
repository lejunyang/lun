import { defineSSRCustomFormElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { tagProps } from './type';
import { defineIcon } from '../icon/Icon';
import { Transition, ref } from 'vue';
import { useNamespace } from 'hooks';

const name = 'tag';
export const Tag = defineSSRCustomFormElement({
  name,
  props: tagProps,
  emits: ['remove', 'afterRemove'],
  setup(props, { emit }) {
    const ns = useNamespace(name);
    const removed = ref(false);
    const remove = () => (removed.value = true);
    const handlers = {
      onLeave() {
        emit('remove');
      },
      onAfterLeave() {
        emit('afterRemove');
      },
    };

    return () => {
      return (
        <Transition name={name} {...handlers}>
          {!removed.value && (
            <span class={ns.themeClass} part="root">
              <slot></slot>
              {props.removable &&
                renderElement('icon', { name: 'x', ...props.removeIconProps, onClick: remove, part: 'icon' })}
            </span>
          )}
        </Transition>
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
