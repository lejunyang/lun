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
    const closed = ref(false);
    const close = () => (closed.value = true);
    const handlers = {
      onLeave() {
        emit('close');
      },
      onAfterLeave() {
        emit('afterClose');
      },
    };

    return () => {
      const { status, iconName, iconLibrary, iconProps, message, description, closable } = props;
      const finalIconName = iconName || status;
      return (
        <Transition {...getTransitionProps(props)} {...handlers}>
          {!closed.value && (
            <span class={ns.t} part="root">
              <slot name="icon">
                {finalIconName &&
                  renderElement('icon', {
                    ...iconProps,
                    name: finalIconName,
                    library: iconLibrary,
                    part: 'icon',
                    class: ns.e('icon'),
                    'data-status': status,
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
              {closable &&
                renderElement('icon', {
                  name: 'x',
                  ...props.closeIconProps,
                  onClick: close,
                  part: 'close-icon',
                  class: ns.e('close-icon'),
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
