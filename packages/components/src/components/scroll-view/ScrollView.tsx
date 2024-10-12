import { defineSSRCustomElement } from 'custom';
import { createDefineElement, toElement } from 'utils';
import { scrollViewEmits, scrollViewProps, ScrollViewState } from './type';
import { useCE } from 'hooks';
import { getCompParts } from 'common';
import {
  getRect,
  listenScroll,
  noop,
  runIfFn,
  supportCSSRegisterProperty,
  toArrayIfNotNil,
  isWindow,
  getWindow,
} from '@lun/utils';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  readonly,
  Transition,
  TransitionProps,
  watchEffect,
} from 'vue';
import { unrefOrGet, useResizeObserver } from '@lun/core';

const name = 'scroll-view';
const parts = ['root'] as const;
const compParts = getCompParts(name, parts);
const registered = new Set<string>();
export const ScrollView = defineSSRCustomElement({
  name,
  props: scrollViewProps,
  emits: scrollViewEmits,
  setup(props) {
    const CE = useCE();
    const state = reactive({
        width: 0,
        height: 0,
        scrollX: 0,
        scrollY: 0,
        scrolling: false,
        xOverflow: false,
        yOverflow: false,
        xForward: false,
        xBackward: false,
        yForward: false,
        yBackward: false,
      }) as ScrollViewState,
      readonlyState = readonly(state);
    const scrollProgress = computed(
      () =>
        [
          state.scrollX / (CE.scrollWidth - state.width || 1),
          state.scrollY / (CE.scrollHeight - state.height || 1),
        ] as const,
    );
    if (supportCSSRegisterProperty) {
      const register = (name: string) => {
        if (!registered.has(name)) {
          registered.add(name);
          (supportCSSRegisterProperty as Exclude<typeof supportCSSRegisterProperty, false>)({
            name: name,
            syntax: '<number>',
            initialValue: '0',
            inherits: true,
          });
        }
      };
      watchEffect(() => {
        const { scrollXPercentVarName, scrollYPercentVarName } = props;
        if (scrollXPercentVarName) register(scrollXPercentVarName);
        if (scrollYPercentVarName) register(scrollYPercentVarName);
      });
    }

    const setSize = (rect: DOMRect | ResizeObserverSize) => {
      state.width = Math.round((rect as DOMRect).width ?? (rect as ResizeObserverSize).inlineSize);
      state.xOverflow = state.width < CE.scrollWidth;
      state.height = Math.round((rect as DOMRect).height ?? (rect as ResizeObserverSize).blockSize);
      state.yOverflow = state.height < CE.scrollHeight;
    };
    onMounted(() => {
      setSize(getRect(CE));
    });
    useResizeObserver({
      targets: CE,
      disabled: () => !props.observeResize,
      observeOptions: { box: 'border-box' },
      callback(entries) {
        setSize(entries[0]?.borderBoxSize?.[0] || getRect(CE));
      },
    });

    let clean = noop;
    watchEffect(() => {
      let target = unrefOrGet(props.target),
        targetEl = isWindow(target) ? target : target === 'window' ? getWindow(CE) : toElement(target);
      if (!targetEl) targetEl = CE;
      clean();
      clean = listenScroll(targetEl, ({ xForward, yForward, offsetX, offsetY, scrolling }) => {
        Object.assign(state, {
          scrollX: offsetX,
          scrollY: offsetY,
          scrolling,
        });
        if (scrolling) {
          xForward !== null &&
            Object.assign(state, {
              xForward,
              xBackward: !xForward,
            });
          yForward !== null &&
            Object.assign(state, {
              yForward,
              yBackward: !yForward,
            });
        }
      });
    });
    onBeforeUnmount(() => clean());

    const getTransitionHandlers = (enterAnimation?: any[], leaveAnimation?: any[]) => {
      return {
        onEnter(el, done) {
          const slot = el as HTMLSlotElement,
            elements = slot.assignedElements();
          enterAnimation &&
            elements.forEach((e, i) => {
              const ani = e.animate(enterAnimation[0], enterAnimation[1]);
              if (!i) ani.onfinish = done;
            });
        },
        onLeave(el, done) {
          const slot = el as HTMLSlotElement,
            elements = slot.assignedElements();
          leaveAnimation &&
            elements.forEach((e, i) => {
              const ani = e.animate(leaveAnimation[0], leaveAnimation[1]);
              if (!i) ani.onfinish = done;
            });
        },
      } as TransitionProps;
    };
    const slots = computed(() => {
      const { getSlots } = props;
      return toArrayIfNotNil(runIfFn(getSlots, readonlyState)).map((slot) => {
        if (!slot) return;
        const { name, enterAnimation, leaveAnimation, show } = slot,
          node = <slot name={name} v-content={show}></slot>;
        return enterAnimation || leaveAnimation ? (
          <Transition {...getTransitionHandlers(enterAnimation, leaveAnimation)}>{node}</Transition>
        ) : (
          node
        );
      });
    });

    return () => {
      const { scrollXPercentVarName, scrollYPercentVarName } = props,
        { value } = scrollProgress;

      return (
        <span part={compParts[0]} style={{ [scrollXPercentVarName!]: value[0], [scrollYPercentVarName!]: value[1] }}>
          {slots.value}
          <slot></slot>
        </span>
      );
    };
  },
});

export type tScrollView = typeof ScrollView;
export type iScrollView = InstanceType<tScrollView>;

export const defineScrollView = createDefineElement(
  name,
  ScrollView,
  {
    scrollXPercentVarName: '--scroll-x-percent',
    scrollYPercentVarName: '--scroll-y-percent',
  },
  parts,
  {},
);
