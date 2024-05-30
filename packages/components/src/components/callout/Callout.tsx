import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { calloutEmits, calloutProps } from './type';
import { defineIcon } from '../icon/Icon';
import { Transition, ref } from 'vue';
import { useNamespace } from 'hooks';
import { getTransitionProps, renderStatusIcon, partsDefine } from 'common';

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
      let { status, iconName, iconLibrary, iconProps, message, description, closable } = props;
      let stack: any;
      if (message instanceof Error) {
        status = 'error';
        // remove first line of stack, and remove leading spaces
        // 'stack' of Error is non-standard, consider adding a process func
        let lines = message.stack?.split('\n') || [];
        lines.shift();
        stack = <pre>{lines.map((i) => '  ' + i.trimStart() + '\n')}</pre>;
        message = message.message;
      }
      return (
        <Transition {...getTransitionProps(props)} {...handlers}>
          {!closed.value && (
            <span class={ns.t} part={partsDefine[name].root} data-status={status}>
              <slot name="icon">
                {renderStatusIcon(status, {
                  name: iconName,
                  library: iconLibrary,
                  ...iconProps,
                  part: partsDefine[name].icon,
                  class: ns.e('icon'),
                })}
              </slot>
              <div class={ns.e('content')} part={partsDefine[name].content}>
                <div class={ns.e('message')} part={partsDefine[name].message}>
                  <slot>{message}</slot>
                </div>
                <div class={ns.e('description')} part={partsDefine[name].description}>
                  <slot name="description">{stack || description}</slot>
                </div>
              </div>
              {closable &&
                renderElement('icon', {
                  name: 'x',
                  ...props.closeIconProps,
                  onClick: close,
                  part: partsDefine[name]['close-icon'],
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
export type iCallout = InstanceType<tCallout>;

export const defineCallout = createDefineElement(name, Callout, {
  icon: defineIcon,
});
