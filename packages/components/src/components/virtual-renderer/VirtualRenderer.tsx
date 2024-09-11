import { defineSSRCustomElement } from 'custom';
import { defineComponent, ref } from 'vue';
import { createDefineElement } from 'utils';
import { virtualRendererProps, VirtualRendererSetupProps } from './type';
import { useVirtualList } from '@lun/core';
import { virtualGetMerge, isFunction } from '@lun/utils';
import { renderCustom } from '../custom-renderer';

const name = 'virtual-renderer';

const options = {
  name,
  props: virtualRendererProps,
  setup(props: VirtualRendererSetupProps, { attrs }: any) {
    const container = ref<HTMLElement>();

    const { wrapperStyle, virtualItems } = useVirtualList(
      virtualGetMerge(
        {
          container,
        },
        props,
      ),
    );
    return () => {
      const { renderer } = props;
      return (
        <div ref={container} {...attrs} style={{ overflow: 'auto' }}>
          <div style={wrapperStyle.value}>
            {isFunction(renderer) ? virtualItems.value.map((i) => renderCustom(renderer(i))) : null}
          </div>
        </div>
      );
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
