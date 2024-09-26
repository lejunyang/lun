import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { scrollViewEmits, scrollViewProps } from './type';
import { useCE } from 'hooks';
import { getCompParts } from 'common';
import { getRect, isRTL, on, rafThrottle, supportCSSRegisterProperty } from '@lun/utils';
import { computed, reactive, watchEffect } from 'vue';
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
      scrolling: false,
    });
    const scrollProgress = computed(
      () => [state.scrollXOffset / CE.scrollWidth, state.scrollYOffset / CE.scrollHeight] as const,
    );
    if (supportCSSRegisterProperty) {
      const register = (name: string) => {
        if (!registered.has(name)) {
          registered.add(name);
          (supportCSSRegisterProperty as Exclude<typeof supportCSSRegisterProperty, false>)({
            name: name,
            syntax: '<number>',
            initialValue: '0',
            inherits: false,
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
      state.width = (rect as DOMRect).width ?? (rect as ResizeObserverSize).inlineSize;
      state.height = (rect as DOMRect).height ?? (rect as ResizeObserverSize).blockSize;
    };
    const rect = getRect(CE);
    setSize(rect);
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
          scrollYOffset = CE.scrollTop;
        Object.assign(state, {
          scrollXOffset,
          scrollYOffset,
          scrolling: true,
        });
      }),
    );

    return () => {
      const { scrollXPercentVarName, scrollYPercentVarName } = props,
        { value } = scrollProgress;

      return (
        <div part={compParts[0]} style={{ [scrollXPercentVarName!]: value[0], [scrollYPercentVarName!]: value[1] }}>
          <slot></slot>
        </div>
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
    scrollYPercentVarName: '---scroll-y-percent',
  },
  parts,
  {},
);
