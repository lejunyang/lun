import { defineSSRCustomElement } from 'custom';
import { tooltipProps } from './type';
import { createDefineElement, renderElement } from 'utils';
import { definePopover } from '../popover/Popover';

const name = 'tooltip';
const Tooltip = defineSSRCustomElement({
  name,
  props: tooltipProps,
  setup(props) {
    return () => {
      return renderElement(
        'popover',
        props,
        <>
          <slot></slot>
          <slot name="content" slot="pop-content"></slot>
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
