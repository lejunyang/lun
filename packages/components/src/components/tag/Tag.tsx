import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { tagEmits, tagProps } from './type';
import { defineIcon } from '../icon/Icon';
import { Transition, ref } from 'vue';
import { useCEExpose, useNamespace } from 'hooks';
import { getCompParts, getTransitionProps } from 'common';

const name = 'tag';
const parts = ['root', 'icon'] as const;
const compParts = getCompParts(name, parts);
export const Tag = defineSSRCustomElement({
  name,
  props: tagProps,
  emits: tagEmits,
  setup(props, { emit, attrs }) {
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
      const { label, removable } = props;
      return (
        <Transition {...getTransitionProps(props, 'remove', 'scaleOut')} {...handlers}>
          {!removed.value && (
            <span
              class={ns.t}
              part={compParts[0]}
              ref={rootRef}
              tabindex={attrs.tabindex as any}
              style={attrs.style as any}
            >
              <slot>{label}</slot>
              {removable &&
                renderElement('icon', {
                  name: 'x',
                  // @ts-ignore
                  ...removable,
                  onClick: remove,
                  part: compParts[1],
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
export type iTag = InstanceType<tTag>;

export const defineTag = createDefineElement(name, Tag, {}, parts, {
  icon: defineIcon,
});
