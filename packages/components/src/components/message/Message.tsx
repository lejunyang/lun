// message 作为一个容器组件，通过Teleport向其他地方渲染，其可防止在任意位置来接收config，需要一个for-static属性，用于给static方法接收config
import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { messageEmits, messageProps } from './type';
import { defineIcon } from '../icon/Icon';
import { BaseTransitionProps, CSSProperties, Teleport, TransitionGroup, computed, reactive, ref } from 'vue';
import { useCEExpose, useNamespace } from 'hooks';
import { Status, getTransitionProps } from 'common';
import { isSupportPopover } from '@lun/utils';
import { CalloutProps } from '../callout/type';

const name = 'callout';
export const MessageHolder = defineSSRCustomElement({
  name,
  props: messageProps,
  emits: messageEmits,
  setup(props, { emit }) {
    const ns = useNamespace(name);
    const support = {
      popover: isSupportPopover(),
      teleport: true,
      fixed: true,
    };
    const type = computed(() => {
      if (['popover', 'fixed', 'teleport'].includes(props.type!) && support[props.type!]) return props.type;
      else
        return Object.keys(support).find((i) => support[i as keyof typeof support]) as 'popover' | 'teleport' | 'fixed';
    });
    const rootRef = ref<HTMLElement>();
    const calloutMap = reactive<Record<string | number, any>>({});
    const keyTimerMap = {} as Record<string | number, ReturnType<typeof setTimeout>>;

    const rootProps = computed(() => {
      const { value } = type;
      const result = {
        popover: value === 'popover' ? ('manual' as const) : undefined,
        styles: {
          position: value === 'fixed' ? 'fixed' : undefined,
        } as CSSProperties,
      };
      return result;
    });
    const transitionHandlers = {
      onEnter() {},
      onAfterEnter() {},
      onLeave() {
        emit('remove');
      },
      onAfterLeave() {
        emit('afterRemove');
      },
    } as BaseTransitionProps;
    const getCalloutHandlers = (key: string | number) => ({
      onPointerenter() {
        const config = calloutMap[key];
        if (config.resetDurationOnHover) {
          clearTimeout(keyTimerMap[key]);
          delete keyTimerMap[key];
        }
      },
      onPointerleave() {
        const config = calloutMap[key];
        if (config.resetDurationOnHover) {
          keyTimerMap[key] = setTimeout(() => {
            delete calloutMap[key];
          }, config.duration);
        }
      },
    });

    const methods = {
      open(
        config?: {
          key?: string | number;
          type?: Status;
          duration?: number;
          resetDurationOnHover?: boolean;
        } & CalloutProps,
      ) {
        config = { status: config?.type, ...config };
        const key = (config.key ||= Date.now());
        const duration = (config.duration ||= 3000);
        if (calloutMap[key]) calloutMap[key] = { ...calloutMap[key], ...config };
        else calloutMap[key] = config;
        if (duration) {
          keyTimerMap[key] = setTimeout(() => {
            delete calloutMap[key];
          }, duration);
        }
      },
    };

    useCEExpose(methods);

    return () => {
      const { to } = props;
      const typeValue = type.value;
      const content = (
        <div class={ns.t} ref={rootRef} part="root" {...rootProps.value}>
          <TransitionGroup {...getTransitionProps(props)} {...transitionHandlers}>
            {Object.keys(calloutMap).flatMap((key) => {
              const callout = calloutMap[key];
              return callout
                ? [
                    renderElement('callout', {
                      ...callout,
                      ...getCalloutHandlers(key),
                    }),
                  ]
                : [];
            })}
          </TransitionGroup>
        </div>
      );
      return typeValue === 'teleport' && to ? <Teleport to={to}>{content}</Teleport> : content;
    };
  },
});

export type tMessageHolder = typeof MessageHolder;

export const defineMessageHolder = createDefineElement(name, MessageHolder, {
  icon: defineIcon,
});
