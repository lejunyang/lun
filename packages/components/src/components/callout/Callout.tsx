import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { calloutEmits, calloutProps } from './type';
import { defineIcon } from '../icon/Icon';
import { Transition, ref } from 'vue';
import { useNamespace } from 'hooks';
import { getTransitionProps, renderStatusIcon, getCompParts } from 'common';
import { runIfFn } from '@lun/utils';

const name = 'callout';
const parts = ['root', 'icon', 'close-icon', 'content', 'message', 'description'] as const;
const compParts = getCompParts(name, parts);
export const Callout = defineSSRCustomElement({
  name,
  props: calloutProps,
  emits: calloutEmits,
  setup(props, { emit }) {
    const ns = useNamespace(name);
    const closed = ref(false);
    const close = () => {
      if (runIfFn(props.beforeClose) === false) return;
      closed.value = true;
    };
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
        // remove first line of stack, and remove leading and trailing spaces
        // 'stack' of Error is non-standard, consider adding a process func
        let lines = message.stack?.split('\n') || [];
        lines.shift();
        stack = <pre>{lines.map((i) => i.trim() + '\n')}</pre>;
        message = message.message;
      }
      return (
        <Transition {...getTransitionProps(props, 'close', 'scaleOut')} {...handlers}>
          {!closed.value && (
            <span class={ns.t} part={compParts[0]} data-status={status}>
              <slot name="icon">
                {renderStatusIcon(status, {
                  name: iconName,
                  library: iconLibrary,
                  ...iconProps,
                  part: compParts[1],
                  class: ns.e('icon'),
                })}
              </slot>
              <div class={ns.e('content')} part={compParts[3]}>
                <div class={ns.e('message')} part={compParts[4]}>
                  <slot>{message}</slot>
                </div>
                <div class={ns.e('description')} part={compParts[5]}>
                  <slot name="description">{stack || description}</slot>
                </div>
              </div>
              {closable &&
                renderElement('icon', {
                  name: 'x',
                  ...props.closeIconProps,
                  onClick: close,
                  part: compParts[2],
                  class: [ns.e('close-icon'), description && !message && ns.is('description-only')],
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

export const defineCallout = createDefineElement(name, Callout, {}, parts, {
  icon: defineIcon,
});
