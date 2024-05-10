import { defineSSRCustomElement } from 'custom';
import { tooltipEmits, tooltipProps } from './type';
import { createDefineElement, renderElement } from 'utils';
import { definePopover, iPopover } from '../popover/Popover';
import { refLikeToDescriptors, useOverflowWatcher, unrefOrGet } from '@lun/core';
import { useCEExpose } from 'hooks';
import { getFirstOfIterable, getInnerTextOfSlot, runIfFn, supportCSSAnchor } from '@lun/utils';
import { getCurrentInstance, onMounted, ref } from 'vue';
import { useContextConfig } from 'config';

const name = 'tooltip';
const Tooltip = defineSSRCustomElement({
  name,
  props: tooltipProps,
  emits: tooltipEmits,
  setup(props, { attrs, emit }) {
    const { CE } = getCurrentInstance()!;
    const { methods, targetOptionMap, openSet } = useOverflowWatcher({
      isDisabled: () => unrefOrGet(props.disabled),
      onOverflowChange(param) {
        emit('overflowChange', param);
      },
      onAttach(el, options) {
        if (el !== CE) popoverRef.value?.attachTarget(el, options);
      },
      onDetach(el) {
        popoverRef.value?.detachTarget(el);
      },
    });
    onMounted(() => {
      methods.attachTarget(CE, {
        getText: () => getInnerTextOfSlot(slotRef.value),
        overflow: () => props.overflow,
      });
    });
    const slotRef = ref<HTMLSlotElement>(),
      popoverRef = ref<iPopover>();
    const zIndex = useContextConfig('zIndex');

    useCEExpose(methods, refLikeToDescriptors({ popover: popoverRef }));

    const beforeOpen = (el: Element) => {
      if (runIfFn(props.beforeOpen) === false) return false;
      const { overflow } = targetOptionMap.get(el) || {};
      if ((overflow === 'enable' || overflow === 'open') && !methods.isOverflow(el)) return false;
    };

    return () => {
      const { open, target, content, anchorName } = props;
      const overflowOpenEl = getFirstOfIterable(openSet);
      const overflowOpen = overflowOpenEl ? true : undefined;
      return (
        <>
          {
            // anchor-name can not cross shadow tree... must define anchor name and position-anchor in one shadow tree
            // so use ::part to override position-anchor
            supportCSSAnchor && overflowOpenEl === CE && anchorName && (
              <style>{`:host{anchor-name:--${anchorName}}#${name}::part(content){position-anchor:--${anchorName}}`}</style>
            )
          }
          {renderElement(
            'popover',
            {
              ...attrs,
              ...props,
              id: name,
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
          )}
        </>
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
