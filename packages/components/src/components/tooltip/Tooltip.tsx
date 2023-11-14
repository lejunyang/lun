import { defineSSRCustomElement } from 'custom';
import { tooltipProps } from './type';
import { createDefineElement, renderElement } from 'utils';
import { definePopover } from '../popover/Popover';
import { useOverflowWatcher } from '@lun/core';
import { useShadowDom } from 'hooks';
import { getInnerTextOfSlot, isFunction } from '@lun/utils';
import { ref } from 'vue';

const name = 'tooltip';
const Tooltip = defineSSRCustomElement({
  name,
  props: tooltipProps,
  inheritAttrs: false,
  setup(props, { attrs }) {
    const shadow = useShadowDom();
    const slotRef = ref<HTMLSlotElement>();
    const { isOverflow } = useOverflowWatcher({
      disable: () => !['enable', 'open'].includes(props.overflow!),
      elGetter: () => shadow.CE,
      getText: () => getInnerTextOfSlot(slotRef.value),
    });
    return () => {
      const { open, overflow, beforeOpen, target } = props;
      const overflowOpen = overflow === 'open' && isOverflow.value ? true : undefined;
      return renderElement(
        'popover',
        {
          ...attrs,
          ...props,
          open: open !== undefined ? open : overflowOpen,
          beforeOpen() {
            if (isFunction(beforeOpen) && beforeOpen() === false) return false;
            if (overflow === 'enable' && !isOverflow.value) return false;
          },
          // make popover display: contents and set target to tooltip CE rather than popover CE
          // so that overflow style can work on tooltip CE
          target: target !== undefined ? target : shadow.CE,
          style: `${attrs.style || ''}display: contents`,
        },
        <>
          <slot ref={slotRef}></slot>
          <slot name="tooltip" slot="pop-content"></slot>
        </>
      );
    };
  },
});

declare module 'vue' {
  export interface GlobalComponents {
    LTooltip: typeof Tooltip;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-tooltip': typeof Tooltip;
  }
}

export const defineTooltip = createDefineElement(name, Tooltip, {
  popover: definePopover,
});
