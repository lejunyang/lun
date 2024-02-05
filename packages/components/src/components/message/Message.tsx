// message 作为一个容器组件，通过Teleport向其他地方渲染，其可防止在任意位置来接收config，需要一个for-static属性，用于给static方法接收config
import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { messageEmits, messageProps } from './type';
import {
  BaseTransitionProps,
  CSSProperties,
  Teleport,
  TransitionGroup,
  computed,
  reactive,
  ref,
  watchEffect,
} from 'vue';
import { useCEExpose, useNamespace } from 'hooks';
import { Status, getTransitionProps } from 'common';
import { isSupportPopover } from '@lun/utils';
import { CalloutProps } from '../callout/type';
import { defineCallout } from '../callout/Callout';

const name = 'message';
export const Message = defineSSRCustomElement({
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
    const showCount = ref(0);
    const show = computed(() => showCount.value > 0);

    const rootProps = computed(() => {
      const { value } = type;
      const result = {
        popover: value === 'popover' ? ('manual' as const) : undefined,
        style: {
          position: value === 'fixed' ? 'fixed' : undefined,
        } as CSSProperties,
      };
      return result;
    });

    watchEffect(() => {
      const root = rootRef.value,
        typeValue = type.value;
      if (show.value && root) {
        if (typeValue === 'popover') {
          root.showPopover();
        }
      }
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
        const { resetDurationOnHover, duration } = calloutMap[key];
        if (resetDurationOnHover && duration !== null) {
          keyTimerMap[key] = setTimeout(() => {
            delete calloutMap[key];
            showCount.value--;
          }, duration);
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
        if (config.duration === undefined) config.duration = 3000;
        const { duration } = config;
        if (calloutMap[key]) {
          clearTimeout(keyTimerMap[key]);
          calloutMap[key] = { ...calloutMap[key], ...config };
        } else {
          calloutMap[key] = config;
          showCount.value++;
        }
        if (duration !== null) {
          keyTimerMap[key] = setTimeout(() => {
            delete calloutMap[key];
            showCount.value--;
          }, duration);
        }
      },
    };

    useCEExpose(methods);

    return () => {
      const { to } = props;
      const typeValue = type.value;
      const content = (
        <div class={ns.t} ref={rootRef} part="root" {...rootProps.value} v-show={show.value}>
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

export type tMessage = typeof Message;

export const defineMessage = createDefineElement(name, Message, {
  callout: defineCallout,
});
