import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { calloutEmits, calloutProps } from './type';
import { defineIcon } from '../icon/Icon';
import { Transition, ref } from 'vue';
import { useNamespace } from 'hooks';
import { getTransitionProps } from 'common';

const name = 'callout';
export const Callout = defineSSRCustomElement({
  name,
  props: calloutProps,
  emits: calloutEmits,
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
      const { iconName, iconLibrary, iconProps, message, description, removable } = props;
      return (
        <Transition {...getTransitionProps(props)} {...handlers}>
          {!removed.value && (
            <span class={ns.t} part={ns.p('root')}>
              <slot name="icon">
                {iconName &&
                  renderElement('icon', {
                    ...iconProps,
                    name: iconName,
                    library: iconLibrary,
                    part: 'icon',
                    class: ns.e('icon'),
                  })}
              </slot>
              <div class={ns.e('content')} part="content">
                <div class={ns.e('message')} part="message">
                  <slot>{message}</slot>
                </div>
                <div class={ns.e('description')} part="description">
                  <slot name="description">{description}</slot>
                </div>
              </div>
              {removable &&
                renderElement('icon', {
                  name: 'x',
                  ...props.removeIconProps,
                  onClick: remove,
                  part: 'remove-icon',
                  class: ns.e('remove-icon'),
                })}
            </span>
          )}
        </Transition>
      );
    };
  },
});

export type tCallout = typeof Callout;

export const defineCallout = createDefineElement(name, Callout, {
  icon: defineIcon,
});
