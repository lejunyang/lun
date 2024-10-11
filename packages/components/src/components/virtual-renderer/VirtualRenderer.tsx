import { defineCustomElement } from 'custom';
import { defineComponent, ref } from 'vue';
import { createDefineElement, virtualUnrefGetMerge } from 'utils';
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
      CE = useCE(),
      getContainer = () => CE || container.value;

    const { wrapperStyle, virtualItems } = useVirtualList(
      virtualGetMerge(
        {
          container: getContainer,
        },
        props,
      ),
    );
    const crossAxis = useVirtualList(
      virtualUnrefGetMerge(
        {
          disabled: () => !props.crossAxis,
          container: getContainer,
        },
        () => props.crossAxis,
      ),
    );
    const getInnerNode = () => {
      const { renderer } = props;
      return (
        <div style={wrapperStyle.value}>
          {isFunction(renderer) ? virtualItems.value.map((i) => renderCustom(renderer(i, crossAxis.virtualItems.value))) : null}
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
