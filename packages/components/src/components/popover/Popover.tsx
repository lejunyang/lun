import { defineSSRCustomElement } from 'custom';
import { CSSProperties, Teleport, computed, ref, toRef, watchEffect, Transition, nextTick } from 'vue';
import { usePopover } from '@lun/core';
import { createDefineElement, renderElement, toGetterDescriptors } from 'utils';
import { popoverProps } from './type';
import { isSupportPopover, isSupportDialog, pick } from '@lun/utils';
import { useCEExpose, useShadowDom } from 'hooks';
import { defineCustomRenderer } from '../custom-renderer/CustomRenderer';
import { autoUpdate, useFloating, arrow, offset } from '@floating-ui/vue';
import { topLayerOverTransforms } from './floating.top-layer-fix';
import { referenceRect } from './floating.store-rects';

export const Popover = defineSSRCustomElement({
  name: 'popover',
  props: popoverProps,
  inheritAttrs: false,
  emits: ['open', 'afterOpen', 'close', 'afterClose'],
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
    const arrowRef = ref();
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
      }
    };
    const hide = () => {
      const popover = popRef.value;
      const dialog = dialogRef.value;
      if (popover) {
        // popover.hidePopover();
      } else if (dialog) {
        dialog.close();
      }
      if (popover || dialog) {
        isShow.value = false;
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

    // handle manually control visibility by outside
    watchEffect(() => {
      if (props.show !== undefined) {
        if (props.show) show();
        else hide();
      }
    });

    const actualPopRef = computed(() => popRef.value || dialogRef.value);

    const { targetHandler, popContentHandler, dialogHandler, options } = usePopover(() => ({
      ...pick(props, ['openDelay', 'closeDelay', 'triggers', 'toggleMode']),
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
    const middleware = computed(() => {
      if (isShow.value) {
        // read isShow, so that trigger update when show change
      }
      const arrowLen = arrowRef.value?.offsetWidth || 0;
      // Get half the arrow box's hypotenuse length as the offset, since it has rotated 45 degrees
      // 取正方形的对角线长度的一半作为floating偏移量，因为它旋转了45度
      const floatingOffset = Math.sqrt(2 * arrowLen ** 2) / 2;
      return [
        topLayerOverTransforms(),
        offset(floatingOffset + (props.offset || 0)),
        props.showArrow &&
          arrow({
            element: arrowRef.value,
          }),
        referenceRect(),
      ].filter(Boolean) as any;
    });
    const { floatingStyles, middlewareData } = useFloating(ceRef, actualPopRef, {
      whileElementsMounted: autoUpdate,
      strategy: 'fixed',
      placement,
      open: isShow,
      middleware,
      transform: toRef(props, 'useTransform'),
    });
    const arrowStyles = computed(() => {
      const { x, y } = middlewareData.value.arrow || {};
      const side = placement.value?.split('-')[0] || 'bottom';
      const staticSide =
        {
          top: 'bottom',
          right: 'left',
          bottom: 'top',
          left: 'right',
        }[side] || 'top';
      return {
        position: 'absolute' as const,
        left: x != null ? `${x}px` : '',
        top: y != null ? `${y}px` : '',
        right: '',
        bottom: '',
        [staticSide]: `${-arrowRef.value?.offsetWidth / 2}px`,
        transform: 'rotate(45deg)',
      };
    });
    const finalFloatingStyles = computed(() => {
      let result: CSSProperties = { ...floatingStyles.value };
      const width = middlewareData.value.rects?.reference.width;
      if (width && props.fullPopWidth) result.width = `${width}px`;
      if (props.adjustPopStyle) result = props.adjustPopStyle(result, middlewareData.value) || result;
      return result;
    });

    // Already exist a prop `show`, so rename the methods, these will override native popover methods
    useCEExpose(
      {
        openPopover: show,
        closePopover: hide,
        togglePopover: toggle,
        isShow: () => (props.show !== undefined ? !!props.show : isShow.value),
      },
      toGetterDescriptors(options, { show: 'delayOpenPopover', hide: 'delayClosePopover' })
    );

    return () => {
      const { value } = type;
      const contentSlot = (
        <>
          {props.showArrow && <div part="arrow" ref={arrowRef} style={arrowStyles.value}></div>}
          <slot name="pop-content">
            {props.content && renderElement('custom-renderer', { content: props.content })}
          </slot>
        </>
      );
      const fixed = (
        <div
          {...popContentHandler}
          part={(value === 'body-fixed' ? 'teleport-fixed' : 'fixed') + ' pop-content'}
          style={finalFloatingStyles.value}
          hidden={isShow.value}
        >
          {contentSlot}
        </div>
      );
      return (
        <>
          {value === 'popover' && (
            <Transition
              name="popover"
              onEnter={() => {
                emit('open');
              }}
              onAfterEnter={() => {
                emit('afterOpen');
              }}
              onLeave={() => {
                emit('close');
              }}
              onAfterLeave={() => {
                popRef.value?.hidePopover();
                emit('afterClose');
              }}
            >
              <div
                {...popContentHandler}
                v-show={isShow.value}
                style={finalFloatingStyles.value}
                part="popover pop-content"
                popover="manual"
                ref={popRef}
              >
                {contentSlot}
              </div>
            </Transition>
          )}
          {value === 'dialog' && (
            <dialog
              {...popContentHandler}
              {...dialogHandler}
              style={finalFloatingStyles.value}
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
