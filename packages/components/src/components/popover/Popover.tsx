import { defineSSRCustomElement } from 'custom';
import { Teleport, computed, ref, toRef, watchEffect } from 'vue';
import { usePopover } from '@lun/core';
import { createDefineElement, renderElement } from 'utils';
import { popoverProps } from './type';
import { isSupportPopover, isSupportDialog, pick } from '@lun/utils';
import { useCEExpose, useShadowDom } from 'hooks';
import { defineCustomRenderer } from '../custom-renderer/CustomRenderer';
import { autoUpdate, useFloating } from '@floating-ui/vue';
import { topLayerOverTransforms } from './floating-ui-top-layer-fix';

export const Popover = defineSSRCustomElement({
  name: 'popover',
  props: popoverProps,
  inheritAttrs: false,
  emits: ['show', 'hide'],
  setup(props, { emit }) {
    const support = {
      popover: isSupportPopover(),
      dialog: isSupportDialog(),
      'body-fixed': true,
      fixed: true,
    };
    const popRef = ref<HTMLDivElement>();
    const dialogRef = ref<HTMLDialogElement>();
    // TODO fixed el ref
    const slotRef = ref<HTMLSlotElement>();
    const isShow = ref(false);
    const type = computed(() => {
      if (['popover', 'dialog', 'fixed', 'body-fixed'].includes(props.type!) && support[props.type!]) return props.type;
      else return Object.keys(support).find((i) => support[i as keyof typeof support]);
    });
    const show = () => {
      const popover = popRef.value;
      const dialog = dialogRef.value;
      if (popover) {
        popover.showPopover();
      } else if (dialog) {
        dialog.show();
      }
      if (popover || dialog) {
        isShow.value = true;
        emit('show');
      }
    };
    const hide = () => {
      const popover = popRef.value;
      const dialog = dialogRef.value;
      if (popover) {
        popover.hidePopover();
      } else if (dialog) {
        dialog.close();
      }
      if (popover || dialog) {
        isShow.value = false;
        emit('hide');
      }
    };
    const toggle = (force?: boolean) => {
      const { value } = popRef;
      if (value) value.togglePopover(force);
      else if (dialogRef.value) {
        if (force !== undefined) {
          if (force) show();
          else hide();
        } else if (isShow.value) hide();
        else show();
      }
    };

    // Already exist a prop `show`, so rename the methods, these will override native popover methods
    useCEExpose({ showPopover: show, hidePopover: hide, togglePopover: toggle });

    // handle manually control visibility by outside
    watchEffect(() => {
      if (props.show !== undefined) {
        if (props.show) show();
        else hide();
      }
    });

    const actualPopRef = computed(() => popRef.value || dialogRef.value);

    const { targetHandler, popContentHandler, dialogHandler } = usePopover(() => ({
      ...pick(props, ['showDelay', 'hideDelay', 'triggers']),
      manual: props.show,
      isShow,
      show,
      hide,
      target: slotRef,
      pop: actualPopRef,
    }));

    const shadow = useShadowDom();
    const ceRef = computed(() => (isShow.value ? shadow.CE : null)); // avoid update float position when not show
    const placement = toRef(props, 'placement');
    const { floatingStyles } = useFloating(ceRef, actualPopRef, {
      whileElementsMounted: autoUpdate,
      strategy: 'fixed',
      placement,
      open: isShow,
      middleware: [topLayerOverTransforms()],
    });

    // TODO Transition v-show={isShow.value}
    return () => {
      const { value } = type;
      const contentSlot = (
        <slot name="pop-content">{props.content && renderElement('custom-renderer', { content: props.content })}</slot>
      );
      const fixed = (
        <div
          {...popContentHandler}
          part={(value === 'body-fixed' ? 'teleport-fixed' : 'fixed') + ' pop-content'}
          style={floatingStyles.value}
          hidden={isShow.value}
        >
          {contentSlot}
        </div>
      );
      return (
        <>
          {value === 'popover' && (
            <div
              {...popContentHandler}
              style={floatingStyles.value}
              part="popover pop-content"
              popover="manual"
              ref={popRef}
            >
              {contentSlot}
            </div>
          )}
          {value === 'dialog' && (
            <dialog
              {...popContentHandler}
              {...dialogHandler}
              style={floatingStyles.value}
              part="dialog pop-content"
              ref={dialogRef}
            >
              {contentSlot}
            </dialog>
          )}
          {value === 'fixed' && fixed}
          {value === 'body-fixed' && <Teleport to="body">{fixed}</Teleport>}
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

export const definePopover = (popoverName?: string, customRendererName?: string) => {
  defineCustomRenderer(customRendererName);
  createDefineElement('popover', Popover)(popoverName);
};
