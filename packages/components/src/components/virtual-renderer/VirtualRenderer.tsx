import { defineSSRCustomElement } from 'custom';
import { onMounted, shallowRef, onBeforeUnmount, watchEffect, isVNode, nextTick, defineComponent, ref } from 'vue';
import { createDefineElement } from 'utils';
import { virtualRendererProps, VirtualRendererSetupProps } from './type';
import { useVirtualList } from '@lun/core';
import { virtualGetMerge } from '@lun/utils';

const name = 'virtual-renderer';

const options = {
  name,
  props: virtualRendererProps,
  setup(props: VirtualRendererSetupProps) {
    const container = ref<HTMLElement>();

    const virtual = useVirtualList(
      virtualGetMerge(
        {
          container,
        },
        props,
      ),
    );
    return () => {
      return <div ref={container}></div>;
    };
  },
};

export const VVirtualRenderer = defineComponent(options);

export const VirtualRenderer = defineSSRCustomElement({
  ...options,
  shadowOptions: null,
});

export type tVirtualRenderer = typeof VirtualRenderer;
export type iVirtualRenderer = InstanceType<tVirtualRenderer>;

export const defineVirtualRenderer = createDefineElement(name, VirtualRenderer);
