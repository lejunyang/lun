import { defineSSRCustomElement } from 'custom';
import { tooltipEmits, tooltipProps } from './type';
import { createDefineElement, renderElement } from 'utils';
import { definePopover, iPopover } from '../popover/Popover';
import { refLikeToDescriptors, useOverflowWatcher, unrefOrGet } from '@lun/core';
import { useCEExpose, useShadowDom } from 'hooks';
import { getFirstOfIterable, getInnerTextOfSlot, runIfFn } from '@lun/utils';
import { ref } from 'vue';
import { useContextConfig } from 'config';

const name = 'tooltip';
const Tooltip = defineSSRCustomElement({
  name,
  props: tooltipProps,
  emits: tooltipEmits,
  setup(props, { attrs, emit }) {
    const { methods, targetOptionMap, openSet } = useOverflowWatcher({
      isDisabled: () => unrefOrGet(props.disabled),
      onOverflowChange(param) {
        emit('overflowChange', param);
      },
      onAttach(el, options) {
        if (el !== shadow.CE) popoverRef.value?.attachTarget(el, options);
      },
      onDetach(el) {
        popoverRef.value?.detachTarget(el);
      },
    });
    const shadow = useShadowDom(({ CE }) =>
      methods.attachTarget(CE, {
        getText: () => getInnerTextOfSlot(slotRef.value),
        overflow: () => props.overflow,
      }),
    );
    const slotRef = ref<HTMLSlotElement>(),
      popoverRef = ref<iPopover>();
    const zIndex = useContextConfig('zIndex');

    useCEExpose(methods, refLikeToDescriptors({ popover: popoverRef }));

    const beforeOpen = (el: Element) => {
      console.log('el', el);
      if (runIfFn(props.beforeOpen) === false) return false;
      const { overflow } = targetOptionMap.get(el) || {};
      if ((overflow === 'enable' || overflow === 'open') && !methods.isOverflow(el)) return false;
    };

    return () => {
      const { open, target, content } = props;
      const overflowOpenEl = getFirstOfIterable(openSet);
      const overflowOpen = overflowOpenEl ? true : undefined;
      return renderElement(
        'popover',
        {
          ...attrs,
          ...props,
          open: open !== undefined ? open : overflowOpen,
          beforeOpen,
          // make popover display: contents and set target to tooltip CE rather than popover CE
          // so that overflow style can work on tooltip CE
          target: target !== undefined ? target : overflowOpenEl,
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
} & ReturnType<typeof useOverflowWatcher>['methods'];

export const defineTooltip = createDefineElement(name, Tooltip, {
  popover: definePopover,
});
