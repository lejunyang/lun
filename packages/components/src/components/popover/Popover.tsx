import { defineSSRCustomElement } from 'custom';
import { CSSProperties, Teleport, computed, ref, toRef, watchEffect, Transition } from 'vue';
import { unrefOrGet, usePopover } from '@lun/core';
import { createDefineElement, renderElement, toGetterDescriptors } from 'utils';
import { popoverProps } from './type';
import { isFunction, isSupportPopover, pick } from '@lun/utils';
import { useCEExpose, useShadowDom } from 'hooks';
import { defineCustomRenderer } from '../custom-renderer/CustomRenderer';
import { autoUpdate, useFloating, arrow, offset } from '@floating-ui/vue';
import { topLayerOverTransforms } from './floating.top-layer-fix';
import { referenceRect } from './floating.store-rects';

const name = 'popover';
export const Popover = defineSSRCustomElement({
  name,
  props: popoverProps,
  inheritAttrs: false,
  emits: ['open', 'afterOpen', 'close', 'afterClose'],
  setup(props, { emit }) {
    const support = {
      popover: isSupportPopover(),
      teleport: true,
      fixed: true,
    };
    const popRef = ref<HTMLDivElement>();
    const slotRef = ref<HTMLSlotElement>();
    const fixedRef = ref<HTMLDivElement>();
    const arrowRef = ref();
    const isShow = ref(false);
    const type = computed(() => {
      if (['popover', 'fixed', 'teleport'].includes(props.type!) && support[props.type!]) return props.type;
      else return Object.keys(support).find((i) => support[i as keyof typeof support]);
    });
    const show = () => {
      const { beforeOpen } = props;
      if (isFunction(beforeOpen) && beforeOpen() === false) return;
      const popover = popRef.value;
      const fixed = fixedRef.value;
      if (popover) popover.showPopover();
      isShow.value = !!(popover || fixed);
    };
    const hide = () => {
      isShow.value = false;
    };
    const toggle = (force?: boolean) => {
      const { value } = popRef;
      if (value) value.togglePopover(force);
      isShow.value = force !== undefined ? force : !isShow.value;
    };

    // handle manually control visibility by outside
    watchEffect(() => {
      if (props.open !== undefined) {
        if (props.open) show();
        else hide();
      }
    });

    const actualPopRef = computed(() => popRef.value || fixedRef.value);
    const virtualTarget = computed(() => {
      const target = unrefOrGet(props.target);
      return isFunction(target?.getBoundingClientRect) ? target : null;
    });
    const actualTargetRef = computed(() => {
      return virtualTarget.value || slotRef.value;
    });

    const { targetHandler, popContentHandler, options } = usePopover(() => ({
      ...pick(props, ['openDelay', 'closeDelay', 'triggers', 'toggleMode']),
      manual: props.open !== undefined,
      isShow,
      show,
      hide,
      target: actualTargetRef,
      pop: actualPopRef,
    }));

    const shadow = useShadowDom();
    const ceRef = computed(() => (isShow.value ? virtualTarget.value || shadow.CE : null)); // avoid update float position when not show
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
    const { floatingStyles, middlewareData, update } = useFloating(ceRef, actualPopRef as any, {
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
        isOpen: () => (props.open !== undefined ? !!props.open : isShow.value),
        updatePosition: update,
      },
      toGetterDescriptors(options, { show: 'delayOpenPopover', hide: 'delayClosePopover' })
    );

    const contentSlot = computed(() => {
      return (
        <>
          {props.showArrow && <div part="arrow" ref={arrowRef} style={arrowStyles.value}></div>}
          <slot name="pop-content">
            {props.content && renderElement('custom-renderer', pick(props, ['content', 'preferHtml']))}
          </slot>
        </>
      );
    });

    const fixed = computed(() => {
      const { value } = type;
      const result = (
        <div
          {...popContentHandler}
          part={(value === 'teleport' ? 'teleport-fixed' : 'fixed') + ' pop-content'}
          style={finalFloatingStyles.value}
          v-show={isShow.value}
          ref={fixedRef}
        >
          {contentSlot.value}
        </div>
      );
      return value === 'teleport' ? <Teleport to={props.to || 'body'}>{result}</Teleport> : result;
    });

    const popover = computed(() => {
      return (
        <div
          {...popContentHandler}
          v-show={isShow.value}
          style={finalFloatingStyles.value}
          part="popover pop-content"
          popover="manual"
          ref={popRef}
        >
          {contentSlot.value}
        </div>
      );
    });

    const transitionHandler = {
      onEnter() {
        emit('open');
      },
      onAfterEnter() {
        emit('afterOpen');
      },
      onLeave() {
        emit('close');
      },
      onAfterLeave() {
        popRef.value?.hidePopover();
        emit('afterClose');
      },
    };

    return () => {
      const { value } = type;
      return (
        <>
          <Transition name="popover" {...transitionHandler}>
            {value === 'popover' ? popover.value : fixed.value}
          </Transition>
          <slot {...targetHandler} ref={slotRef}></slot>
        </>
      );
    };
  },
});

export const definePopover = createDefineElement(name, Popover, {
  'custom-renderer': defineCustomRenderer,
});
