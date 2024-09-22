import { defineSSRCustomElement } from 'custom';
import { createDefineElement, openPopover, renderElement } from 'utils';
import { MessageMethods, MessageOpenConfig, messageEmits, messageProps } from './type';
import {
  BaseTransitionProps,
  CSSProperties,
  TransitionGroup,
  computed,
  onBeforeUnmount,
  reactive,
  ref,
  watchEffect,
} from 'vue';
import { useCEExpose, useNamespace } from 'hooks';
import { getCompParts, getTransitionProps, popSupport } from 'common';
import { capitalize, objectKeys, omit, runIfFn } from '@lun/utils';
import { defineCallout } from '../callout/Callout';
import { methods } from './message.static-methods';
import { defineTeleportHolder, useTeleport } from '../teleport-holder';
import { useContextConfig } from 'config';
import { refLikeToDescriptors } from '@lun/core';

const name = 'message';
const parts = ['root'] as const;
const compParts = getCompParts(name, parts);
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
      const calloutMap = reactive<Record<string | number, MessageOpenConfig>>({}),
        /** keep the callout config after delete it from calloutMap, so that we can access it in onLeave and onAfterLeave */
        tempCalloutMap: Record<string | number, MessageOpenConfig> = {};
      const keyTimerMap = {} as Record<string | number, ReturnType<typeof setTimeout>>;
      const showCount = ref(0);
      const show = computed(() => showCount.value > 0);
      const zIndex = useContextConfig('zIndex');
      const isPopover = computed(() => type.value === 'popover');
      const isFixed = computed(() => type.value === 'normal' || type.value === 'teleport');

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
        if (show.value && isPopover.value) openPopover(rootRef);
      });

      const clearTimer = (key: string | number) => {
        clearTimeout(keyTimerMap[key]);
        delete keyTimerMap[key];
      };
      const startTimer = (key: string | number, duration: string | number | undefined) => {
        if (duration !== null && duration !== 'none') {
          keyTimerMap[key] = setTimeout(() => methods.close(key), +duration!);
        }
      };
      const methods = {
        open(config) {
          config = {
            ...omit(props, ['type', 'placement', 'to']),
            closeTransition: getTransitionProps(props, 'close'),
            ...ns.themes(),
            status: config?.type,
            ...config,
            class: ns.e('callout'),
          };
          const key = (config.key ||= Date.now());
          (config as any)['data-key'] = key;
          Object.assign(config, getCalloutHandlers(config));
          if (config.duration === undefined) config.duration = 3000;
          const { duration } = config;
          if (calloutMap[key]) {
            clearTimer(key);
            calloutMap[key] = { ...calloutMap[key], ...config };
          } else calloutMap[key] = config;
          startTimer(key, duration);
        },
        close(key) {
          if ((tempCalloutMap[key] = calloutMap[key])) {
            clearTimer(key);
            delete calloutMap[key];
          }
        },
        closeAll() {
          objectKeys(calloutMap).forEach(methods.close);
        },
      } as MessageMethods;

      type Event = keyof typeof messageEmits;
      const createHandle = (type: Event, afterFn?: (el: any, key: any) => void) => {
        const event = `on${capitalize(type)}` as `on${Capitalize<Event>}`;
        return (el: any) => {
          const { key } = el.dataset;
          runIfFn((calloutMap[key!] || tempCalloutMap[key])?.[event], new CustomEvent<undefined>(type));
          emit(type as any);
          afterFn?.(el, key);
        };
      };
      const allClosed = createHandle('allClosed');
      const transitionHandlers = {
        onEnter: createHandle('open', () => showCount.value++),
        onAfterEnter: createHandle('afterOpen'),
        onLeave: createHandle('close'),
        onAfterLeave: createHandle('afterClose', (el, key) => {
          if (!--showCount.value) allClosed(el);
          delete tempCalloutMap[key];
        }),
      } as BaseTransitionProps;
      // must destruct to get original beforeClose
      const getCalloutHandlers = ({
        key,
        beforeClose,
        resetDurationOnHover,
        duration,
        onPointerenter,
        onPointerleave,
      }: MessageOpenConfig) => ({
        onPointerenter: resetDurationOnHover
          ? (e: PointerEvent) => (clearTimer(key!), runIfFn(onPointerenter, e))
          : onPointerenter,
        onPointerleave: resetDurationOnHover
          ? (e: PointerEvent) => (startTimer(key!, duration), runIfFn(onPointerleave, e))
          : onPointerleave,
        beforeClose: () => {
          if (runIfFn(beforeClose) === false) return false;
          // return false to prevent default close behavior in callout
          return methods.close(key!), false;
        },
      });

      onBeforeUnmount(() => Object.values(keyTimerMap).forEach((t) => clearTimeout(t)));

      useCEExpose(
        methods,
        refLikeToDescriptors({
          showCount,
        }),
      );

      const [wrapTeleport, vnodeHandlers] = useTeleport(props, () => type.value === 'teleport');

      return () => {
        const { placement } = props;
        const content = (
          <div
            class={[ns.t, ns.m(placement), ns.is('fixed', isFixed)]}
            ref={rootRef}
            part={compParts[0]}
            {...rootProps.value}
            v-show={show.value}
            {...vnodeHandlers}
          >
            <TransitionGroup {...getTransitionProps(props, 'callout', 'message')} {...transitionHandlers}>
              {Object.values(calloutMap).map((callout) => callout && renderElement('callout', callout))}
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

export const defineMessage = createDefineElement(
  name,
  Message,
  {
    resetDurationOnHover: true,
    placement: 'top',
    offset: 10,
    closable: true,
  },
  parts,
  {
    callout: defineCallout,
    'teleport-holder': defineTeleportHolder,
  },
);
