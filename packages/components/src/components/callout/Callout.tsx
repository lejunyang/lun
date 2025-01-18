import { defineCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { calloutEmits, calloutProps } from './type';
import { defineIcon } from '../icon/Icon';
import { Transition, ref, shallowRef, watchEffect } from 'vue';
import { useNamespace, useSlot } from 'hooks';
import { getTransitionProps, renderStatusIcon, getCompParts } from 'common';
import { runIfFn } from '@lun-web/utils';

const name = 'callout';
const parts = ['root', 'icon', 'close-icon', 'message', 'description'] as const;
const compParts = getCompParts(name, parts);
export const Callout = defineCustomElement({
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

    const messageRef = shallowRef(),
      descriptionRef = shallowRef(),
      statusRef = ref();

    watchEffect(() => {
      const { status, message, description } = props;
      if (message instanceof Error) {
        statusRef.value = 'error';
        // remove first line of stack, and remove leading and trailing spaces
        // 'stack' of Error is non-standard, consider adding a process func
        let lines = message.stack?.split('\n') || [];
        lines.shift();
        messageRef.value = message.message;
        descriptionRef.value = lines.length ? <pre>{lines.map((i) => i.trim() + '\n')}</pre> : description;
      } else {
        messageRef.value = message;
        descriptionRef.value = description;
        statusRef.value = status;
      }
    });

    const [getIconSlot, iconEmpty] = useSlot('icon');
    const [getMessageSlot, messageEmpty] = useSlot('message', messageRef);
    const [getDescSlot, descEmpty] = useSlot('description', descriptionRef);

    return () => {
      const { iconName, iconLibrary, iconProps, message, description, closable } = props;
      const colStart = iconEmpty.value ? 0 : 1;
      return (
        <Transition {...getTransitionProps(props, 'close', 'scaleOut')} {...handlers}>
          {!closed.value && (
            <span
              class={ns.t}
              part={compParts[0]}
              data-status={statusRef.value}
              style={{
                display: 'grid',
                gridTemplateColumns: [iconEmpty.value ? '' : 'auto', '1fr', closable ? 'auto' : ''].join(' '),
                alignItems: 'center',
              }}
            >
              {getIconSlot(
                renderStatusIcon(statusRef.value, {
                  name: iconName,
                  library: iconLibrary,
                  ...iconProps,
                  part: compParts[1],
                  class: ns.e('icon'),
                }),
              )}
              <div
                class={ns.e('message')}
                part={compParts[3]}
                v-show={!messageEmpty.value}
                style={{ gridColumn: colStart + 1 }}
              >
                {getMessageSlot()}
              </div>
              <div
                class={ns.e('description')}
                part={compParts[4]}
                v-show={!descEmpty.value}
                style={{ gridColumn: colStart + 1, gridRow: messageEmpty.value ? 1 : 2 }}
              >
                {getDescSlot()}
              </div>
              {closable &&
                renderElement('icon', {
                  name: 'x',
                  /** @ts-ignore */
                  ...closable,
                  onClick: close,
                  part: compParts[2],
                  class: [ns.e('close-icon'), description && !message && ns.is('description-only')],
                  style: { gridColumn: colStart + 2 },
                })}
            </span>
          )}
        </Transition>
      );
    };
  },
});

export type tCallout = typeof Callout;
export type CalloutExpose = {};
export type iCallout = InstanceType<tCallout> & CalloutExpose;

export const defineCallout = createDefineElement(name, Callout, {}, parts, [defineIcon]);
