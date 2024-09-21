import { defineCustomElement } from 'custom';
import { defineComponent, ref } from 'vue';
import { createDefineElement } from 'utils';
import { virtualRendererProps, VirtualRendererSetupProps } from './type';
import { useVirtualList } from '@lun/core';
import { isFunction, virtualGetMerge } from '@lun/utils';
import { renderCustom } from '../custom-renderer';
import { useCE } from 'hooks';

const name = 'virtual-renderer';

const options = {
  name,
  props: virtualRendererProps,
  setup(props: VirtualRendererSetupProps, { attrs }: any) {
    const container = ref<HTMLElement>(),
      CE = useCE();

    const { wrapperStyle, virtualItems } = useVirtualList(
      virtualGetMerge(
        {
          container: () => CE || container.value,
        },
        props,
      ),
    );
    const getInnerNode = () => {
      const { renderer } = props;
      return (
        <div style={wrapperStyle.value}>
          {isFunction(renderer) ? virtualItems.value.map((i) => renderCustom(renderer(i))) : null}
        </div>
      );
    };

    return () =>
      CE ? (
        getInnerNode()
      ) : (
        <div ref={container} {...attrs} style={{ overflow: 'auto' }}>
          {getInnerNode()}
        </div>
      );
  },
};

export const VueVirtualRenderer = defineComponent(options);

export const VirtualRenderer = defineCustomElement({
  ...options,
  shadowOptions: null,
});

export type tVirtualRenderer = typeof VirtualRenderer;
export type iVirtualRenderer = InstanceType<tVirtualRenderer>;

export const defineVirtualRenderer = createDefineElement(name, VirtualRenderer);
