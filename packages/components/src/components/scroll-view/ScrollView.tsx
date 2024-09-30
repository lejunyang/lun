import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { scrollViewEmits, scrollViewProps } from './type';
import { useCE } from 'hooks';
import { getCompParts } from 'common';
import { getRect, hyphenate, isRTL, on, rafThrottle, supportCSSRegisterProperty } from '@lun/utils';
import { computed, onMounted, reactive, watchEffect } from 'vue';
import { useResizeObserver } from '@lun/core';

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
      scrollXOffset: 0,
      scrollYOffset: 0,
    });
    const slotState = reactive({
      xOverflow: false,
      yOverflow: false,
      scrolling: false,
      xForward: false,
      xBackward: false,
      yForward: false,
      yBackward: false,
    });
    const scrollProgress = computed(
      () =>
        [
          state.scrollXOffset / (CE.scrollWidth - state.width),
          state.scrollYOffset / (CE.scrollHeight - state.height),
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
      slotState.xOverflow = state.width < CE.scrollWidth;
      state.height = Math.round((rect as DOMRect).height ?? (rect as ResizeObserverSize).blockSize);
      slotState.yOverflow = state.height < CE.scrollHeight;
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

    on(
      CE,
      'scroll',
      rafThrottle(() => {
        const scrollXOffset = CE.scrollLeft * (isRTL(CE) ? -1 : 1),
          scrollYOffset = CE.scrollTop,
          xForward = scrollXOffset > state.scrollXOffset,
          yForward = scrollYOffset > state.scrollYOffset;
        Object.assign(state, {
          scrollXOffset,
          scrollYOffset,
        });
        Object.assign(slotState, {
          xForward,
          xBackward: !xForward,
          yForward,
          yBackward: !yForward,
          // scrolling: true,
        });
      }),
    );

    return () => {
      const { scrollXPercentVarName, scrollYPercentVarName } = props,
        { value } = scrollProgress;

      return (
        <span part={compParts[0]} style={{ [scrollXPercentVarName!]: value[0], [scrollYPercentVarName!]: value[1] }}>
          <>
            {Object.entries(slotState).map(([key, value]) => (
              <slot name={hyphenate(key)} v-show={value}></slot>
            ))}
            <slot></slot>
          </>
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
