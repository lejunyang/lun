import { defineSSRCustomElement } from 'custom';
import { tooltipProps } from './type';
import { createDefineElement, renderElement } from 'utils';
import { definePopover } from '../popover/Popover';
import { useOverflowWatcher } from '@lun/core';
import { useShadowDom } from 'hooks';
import { isFunction } from '@lun/utils';

const name = 'tooltip';
const Tooltip = defineSSRCustomElement({
  name,
  props: tooltipProps,
  setup(props) {
    const shadow = useShadowDom();
    const { isOverflow } = useOverflowWatcher({
      disable: () => !['enable', 'open'].includes(props.overflow!),
      elGetter: () => shadow.CE,
    });
    return () => {
      const { open, overflow, beforeOpen } = props;
      const overflowOpen = overflow === 'open' && isOverflow.value ? true : undefined;
      return renderElement(
        'popover',
        {
          ...props,
          open: open !== undefined ? open : overflowOpen,
          beforeOpen() {
            if (isFunction(beforeOpen) && beforeOpen() === false) return false;
            if (overflow === 'enable' && !isOverflow.value) return false;
          },
        },
        <>
          <slot></slot>
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
