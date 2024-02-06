import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { MessageOpenConfig, messageEmits, messageProps } from './type';
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
import { getTransitionProps } from 'common';
import { isFunction, isSupportPopover, omit } from '@lun/utils';
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
    const calloutMap = reactive<Record<string | number, MessageOpenConfig>>({});
    const keyTimerMap = {} as Record<string | number, ReturnType<typeof setTimeout>>;
    const showCount = ref(0);
    const show = computed(() => showCount.value > 0);

    const placementMarginMap = {
      'top-start': '0 auto auto 0',
      top: '0 auto auto',
      'top-end': '0 0 auto auto',
      left: 'auto auto auto 0',
      center: 'auto',
      right: 'auto 0 auto auto',
      'bottom-start': 'auto auto 0 0',
      bottom: 'auto auto 0',
      'bottom-end': 'auto 0 0 auto',
    };
    const rootProps = computed(() => {
      const { placement } = props;
      const { value } = type;
      const result = {
        popover: value === 'popover' ? ('manual' as const) : undefined,
        style: {
          position: value === 'fixed' ? 'fixed' : undefined,
          margin: placementMarginMap[placement!],
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

    const methods = {
      open(config) {
        config = {
          ...omit(props, ['type', 'placement', 'to']),
          ...getTransitionProps(props, 'callout'),
          status: config?.type,
          ...config,
          class: ns.e('callout'),
        };
        const key = (config.key ||= Date.now());
        (config as any)['data-key'] = key;
        if (config.duration === undefined) config.duration = 3000;
        const { duration } = config;
        if (calloutMap[key]) {
          clearTimeout(keyTimerMap[key]);
          calloutMap[key] = { ...calloutMap[key], ...config };
        } else {
          calloutMap[key] = config;
          showCount.value++;
        }
        if (duration !== null && duration !== 'none') {
          keyTimerMap[key] = setTimeout(() => methods.close(key), +duration);
        }
      },
      close(key) {
        const config = calloutMap[key];
        if (config) {
          clearTimeout(keyTimerMap[key]);
          delete calloutMap[key];
          showCount.value--;
        }
      },
      closeAll() {
        Object.keys(calloutMap).forEach(methods.close);
      },
    } as MessageMethods;

    const createHandleClose = (type: 'close' | 'afterClose') => {
      const event = type === 'close' ? 'onClose' : 'onAfterClose';
      return (el: any) => {
        const { key } = el.dataset;
        const config = calloutMap[key!];
        if (config) {
          const handler = config[event];
          if (isFunction(handler)) handler(new CustomEvent(type));
        }
        emit(type as any);
      };
    };
    const transitionHandlers = {
      onEnter() {},
      onAfterEnter() {},
      onLeave: createHandleClose('close'),
      onAfterLeave: createHandleClose('afterClose'),
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
        if (resetDurationOnHover && duration !== null && duration !== 'none') {
          keyTimerMap[key] = setTimeout(() => methods.close(key), +duration!);
        }
      },
    });

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

export type MessageMethods = {
  open(config?: MessageOpenConfig): void;
  close(key: string | number): void;
  closeAll(): void;
}

export type tMessage = typeof Message;
export type iMessage = InstanceType<tMessage> & MessageMethods;

export const defineMessage = createDefineElement(name, Message, {
  callout: defineCallout,
});
