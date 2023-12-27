import { defineSSRCustomFormElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { tagEmits, tagProps } from './type';
import { defineIcon } from '../icon/Icon';
import { Transition, ref } from 'vue';
import { useCEExpose, useNamespace } from 'hooks';
import { getTransitionProps } from 'common';

const name = 'tag';
export const Tag = defineSSRCustomFormElement({
  name,
  props: tagProps,
  emits: tagEmits,
  setup(props, { emit }) {
    const ns = useNamespace(name);
    const removed = ref(false);
    const rootRef = ref<HTMLElement>();
    const remove = () => (removed.value = true);
    const handlers = {
      onLeave() {
        emit('remove');
      },
      onAfterLeave() {
        emit('afterRemove');
      },
    };

    // calling focus on tag doesn't work because of display: contents, so expose span's focus
    const focus = () => rootRef.value?.focus();
    useCEExpose({ focus });

    return () => {
      return (
        <Transition {...getTransitionProps(props)} {...handlers}>
          {!removed.value && (
            <span class={ns.t} part={ns.p('root')} ref={rootRef}>
              <slot>{props.label}</slot>
              {props.removable &&
                renderElement('icon', {
                  name: 'x',
                  ...props.removeIconProps,
                  onClick: remove,
                  part: ns.p('icon'),
                  class: ns.e('icon'),
                })}
            </span>
          )}
        </Transition>
      );
    };
  },
});

export type tTag = typeof Tag;

export const defineTag = createDefineElement(name, Tag, {
  icon: defineIcon,
});
