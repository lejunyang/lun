import { defineSSRCustomElement } from 'custom';
import { tooltipProps } from './type';
import { createDefineElement, renderElement } from 'utils';
import { definePopover, iPopover } from '../popover/Popover';
import { refLikeToDescriptors, useOverflowWatcher } from '@lun/core';
import { useCEExpose, useShadowDom } from 'hooks';
import { getInnerTextOfSlot, isFunction, runIfFn } from '@lun/utils';
import { ref } from 'vue';
import { useContextConfig } from 'config';

const name = 'tooltip';
const Tooltip = defineSSRCustomElement({
  name,
  props: tooltipProps,
  setup(props, { attrs }) {
    const shadow = useShadowDom();
    const slotRef = ref<HTMLSlotElement>(),
      popoverRef = ref<iPopover>();
    const zIndex = useContextConfig('zIndex');
    const { isOverflow } = useOverflowWatcher({
      disable: () => !['enable', 'open'].includes(props.overflow!),
      elGetter: () => shadow.CE,
      getText: () => getInnerTextOfSlot(slotRef.value),
    });

    useCEExpose({}, refLikeToDescriptors({ popover: popoverRef }));

    return () => {
      const { open, overflow, beforeOpen, target, content } = props;
      const overflowOpen = overflow === 'open' && isOverflow.value ? true : undefined;
      return renderElement(
        'popover',
        {
          ...attrs,
          ...props,
          open: open !== undefined ? open : overflowOpen,
          beforeOpen() {
            if (runIfFn(beforeOpen) === false) return false;
            if (overflow === 'enable' && !isOverflow.value) return false;
          },
          // make popover display: contents and set target to tooltip CE rather than popover CE
          // so that overflow style can work on tooltip CE
          target: target !== undefined ? target : shadow.CE,
          style: `${attrs.style || ''}display: contents`,
          zIndex: zIndex.tooltip,
          ref: popoverRef,
        },
        <>
          <slot ref={slotRef}></slot>
          {!content && <slot name="tooltip" slot="pop-content"></slot>}
        </>,
      );
    };
  },
});

export type tTooltip = typeof Tooltip;
export type iTooltip = InstanceType<tTooltip> & {
  readonly popover: iPopover;
};

export const defineTooltip = createDefineElement(name, Tooltip, {
  popover: definePopover,
});
