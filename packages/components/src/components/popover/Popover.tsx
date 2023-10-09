import { defineSSRCustomElement } from 'custom';
import { GlobalStaticConfig } from 'config';
import { computed, ref, shallowReactive } from 'vue';
import { usePopover } from '@lun/core';
import { createDefineElement, getCommonElementOptions, setDefaultsForPropOptions } from 'utils';
import { popoverProps } from './type';
import { isSupportPopover, isSupportDialog } from '@lun/utils';
import { useCEExpose } from 'hooks';

export const Popover = defineSSRCustomElement({
  ...getCommonElementOptions('popover'),
  props: setDefaultsForPropOptions(popoverProps, GlobalStaticConfig.defaultProps.popover),
  emit: ['show', 'hide'],
  setup(props,) {
    const support = {
      popover: isSupportPopover(),
      dialog: isSupportDialog(),
      teleportFixed: true,
      fixed: true,
    };
    const popRef = ref<HTMLDivElement>();
    const slotRef = ref<HTMLSlotElement>();
    const type = computed(() => {
      if (['popover', 'dialog', 'fixed', 'teleportFixed'].includes(props.type!) && support[props.type!])
        return props.type;
      else return Object.keys(support).find((i) => support[i as keyof typeof support]);
    });
    const state = shallowReactive({
      show: false,
    });
    const show = () => {
      const { value } = popRef;
      if (value) {
        state.show = true;
        value.showPopover();
      }
      console.log('actual show');
    };
    const hide = () => {
      const { value } = popRef;
      if (value) {
        state.show = false;
        value.hidePopover();
      }
      console.log('actual hide');
    };
    const toggle = (force?: boolean) => {
      const { value } = popRef;
      if (value) value.togglePopover(force);
    };

    const { targetHandler, popContentHandler } = usePopover(() => ({
      ...props,
      show,
      hide,
      targetGetter: () => slotRef.value,
      popGetter: () => popRef.value,
    }));

    useCEExpose({ show, hide, toggle });

    return () => {
      const { value } = type;
      return (
        <>
          {value === 'popover' && (
            <div {...popContentHandler} popover="manual" ref={popRef}>
              <slot name="content"></slot>
            </div>
          )}
          {value === 'dialog' && (
            <dialog>
              <slot name="content"></slot>
            </dialog>
          )}
          <slot {...targetHandler} ref={slotRef}></slot>
        </>
      );
    };
  },
});

declare module 'vue' {
  export interface GlobalComponents {
    LPopover: typeof Popover;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-popover': typeof Popover;
  }
}

export const definePopover = createDefineElement('popover', Popover);
