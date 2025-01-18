import { defineCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { tagEmits, tagProps } from './type';
import { defineIcon } from '../icon/Icon';
import { Transition, ref } from 'vue';
import { interceptCEMethods, useNamespace } from 'hooks';
import { getCompParts, getTransitionProps } from 'common';

const name = 'tag';
const parts = ['root', 'icon'] as const;
const compParts = getCompParts(name, parts);
export const Tag = defineCustomElement({
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
    interceptCEMethods(rootRef);

    return () => {
      const { label, removable, tabindex } = props;
      return (
        <Transition {...getTransitionProps(props, 'remove', 'scaleOut')} {...handlers}>
          {!removed.value && (
            <span class={ns.t} part={compParts[0]} ref={rootRef} tabindex={tabindex} {...attrs}>
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
export type TagExpose = {};
export type iTag = InstanceType<tTag> & TagExpose;

export const defineTag = createDefineElement(name, Tag, {}, parts, [defineIcon]);
