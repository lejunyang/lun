import { defineSSRCustomElement } from 'custom';
import { createDefineElement } from 'utils';
import { scrollViewEmits, scrollViewProps } from './type';
import { useCE } from 'hooks';
import { getCompParts } from 'common';
import { getRect, isRTL, on } from '@lun/utils';
import { computed, reactive, watchEffect } from 'vue';
import { useResizeObserver } from '@lun/core';

const name = 'scroll-view';
const parts = [] as const;
const compParts = getCompParts(name, parts);
export const ScrollView = defineSSRCustomElement({
  name,
  props: scrollViewProps,
  emits: scrollViewEmits,
  setup(props) {
    const CE = useCE();
    const state = reactive({
      width: 0,
      height: 0,
      xScrollOffset: 0,
      yScrollOffset: 0,
      scrolling: false,
    });

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

    on(CE, 'scroll', () => {
      const xScrollOffset = CE.scrollLeft * (isRTL(CE) ? -1 : 1),
        yScrollOffset = CE.scrollTop;
      state.xScrollOffset = xScrollOffset;
      state.yScrollOffset = yScrollOffset;
    });

    return () => {

      return <slot style={{}}></slot>;
    };
  },
});

export type tScrollView = typeof ScrollView;
export type iScrollView = InstanceType<tScrollView>;

export const defineScrollView = createDefineElement(name, ScrollView, {}, parts, {});
