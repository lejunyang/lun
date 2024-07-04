import { defineSSRCustomElement } from 'custom';
import { createDefineElement, renderElement } from 'utils';
import { MessageMethods, MessageOpenConfig, messageEmits, messageProps } from './type';
import { BaseTransitionProps, CSSProperties, TransitionGroup, computed, reactive, ref, watchEffect } from 'vue';
import { useCEExpose, useNamespace } from 'hooks';
import { getTransitionProps, popSupport } from 'common';
import { isFunction, objectKeys, omit } from '@lun/utils';
import { defineCallout } from '../callout/Callout';
import { methods } from './message.static-methods';
import { defineTeleportHolder, useTeleport } from '../teleport-holder';
import { useContextConfig } from 'config';

const name = 'message';
export const Message = Object.assign(
  defineSSRCustomElement({
    name,
    props: messageProps,
    emits: messageEmits,
    setup(props, { emit }) {
      const ns = useNamespace(name);
      const type = computed(() => {
        if (popSupport[props.type!]) return props.type;
        else return objectKeys(popSupport).find((i) => popSupport[i]);
      });
      const rootRef = ref<HTMLElement>();
      const calloutMap = reactive<Record<string | number, MessageOpenConfig>>({});
      const keyTimerMap = {} as Record<string | number, ReturnType<typeof setTimeout>>;
      const showCount = ref(0);
      const show = computed(() => showCount.value > 0);
      const zIndex = useContextConfig('zIndex');
      const isPopover = computed(() => type.value === 'popover');
      const isFixed = computed(() => type.value === 'position' || type.value === 'teleport');

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
        const { placement, offset } = props;
        let margin = placementMarginMap[placement!];
        if (margin && offset != null) margin = margin.replace(/0/g, `${offset}${isNaN(offset as any) ? '' : 'px'}`);
        const result = {
          popover: isPopover.value ? ('manual' as const) : undefined,
          style: {
            position: isFixed.value ? 'fixed' : undefined,
            zIndex: zIndex.message,
            margin,
          } as CSSProperties,
        };
        return result;
      });

      watchEffect(() => {
        const root = rootRef.value;
        if (show.value && root) {
          if (isPopover.value) {
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

      const [wrapTeleport, vnodeHandlers] = useTeleport(props, () => type.value === 'teleport');

      return () => {
        const { placement } = props;
        const content = (
          <div
            class={[ns.t, ns.m(placement), ns.is('fixed', isFixed)]}
            ref={rootRef}
            part={ns.p('root')}
            {...rootProps.value}
            v-show={show.value}
            {...vnodeHandlers}
          >
            <TransitionGroup {...getTransitionProps(props)} {...transitionHandlers}>
              {objectKeys(calloutMap).flatMap((key) => {
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
        return wrapTeleport(content);
      };
    },
  }),
  methods,
);

export type tMessage = typeof Message;
export type MessageExpose = MessageMethods;
export type iMessage = InstanceType<tMessage> & MessageExpose;

export const defineMessage = createDefineElement(name, Message, {
  callout: defineCallout,
  'teleport-holder': defineTeleportHolder,
});
