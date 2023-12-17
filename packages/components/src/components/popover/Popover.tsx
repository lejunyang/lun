import { defineSSRCustomElement } from 'custom';
import { CSSProperties, Teleport, computed, ref, toRef, watchEffect, Transition } from 'vue';
import { unrefOrGet, usePopover } from '@lun/core';
import { createDefineElement, toGetterDescriptors } from 'utils';
import { popoverEmits, popoverProps } from './type';
import { isFunction, isSupportPopover, pick } from '@lun/utils';
import { useCEExpose, useNamespace, useShadowDom } from 'hooks';
import { VCustomRenderer } from '../custom-renderer/CustomRenderer';
import { autoUpdate, useFloating, arrow, offset } from '@floating-ui/vue';
import { topLayerOverTransforms } from './floating.top-layer-fix';
import { referenceRect } from './floating.store-rects';
import { getTransitionProps } from 'common';

const name = 'popover';
export const Popover = defineSSRCustomElement({
  name,
  props: popoverProps,
  inheritAttrs: false,
  emits: popoverEmits,
  setup(props, { emit }) {
    const ns = useNamespace(name);
    const support = {
      popover: isSupportPopover(),
      teleport: true,
      fixed: true,
    };
    const popRef = ref<HTMLDivElement>();
    const slotRef = ref<HTMLSlotElement>();
    const fixedRef = ref<HTMLDivElement>();
    const arrowRef = ref();
    const isOpen = ref(false);
    const isShow = ref(false); // after animation ends, it will be false
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
      isOpen.value = !!(popover || fixed);
      isShow.value = isOpen.value;
    };
    const hide = () => {
      isOpen.value = false;
    };
    const toggle = (force?: boolean) => {
      const { value } = popRef;
      if (value) value.togglePopover(force);
      isOpen.value = force !== undefined ? force : !isOpen.value;
      if (isOpen.value) isShow.value = true;
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
    const ceRef = computed(() => (isOpen.value ? virtualTarget.value || shadow.CE : null)); // avoid update float position when not show
    const placement = toRef(props, 'placement');
    const middleware = computed(() => {
      return [
        type.value === 'popover' && topLayerOverTransforms(),
        offset(() => {
          const arrowLen = arrowRef.value?.offsetWidth || 0;
          // Get half the arrow box's hypotenuse length as the offset, since it has rotated 45 degrees
          // 取正方形的对角线长度的一半作为floating偏移量，因为它旋转了45度
          const floatingOffset = Math.sqrt(2 * arrowLen ** 2) / 2;
          return floatingOffset + (props.offset || 0);
        }),
        props.showArrow &&
          arrow({
            element: arrowRef,
          }),
        referenceRect(),
      ].filter(Boolean) as any;
    });
    const {
      floatingStyles,
      middlewareData,
      update,
      placement: actualPlacement,
    } = useFloating(ceRef, actualPopRef as any, {
      whileElementsMounted: (...args) => {
        return autoUpdate(...args, {
          elementResize: false,
        });
      },
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
        clipPath: 'polygon(0 0, 0% 100%, 100% 0)',
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
        isOpen: () => (props.open !== undefined ? !!props.open : isOpen.value),
        updatePosition: update,
      },
      toGetterDescriptors(options, { show: 'delayOpenPopover', hide: 'delayClosePopover' }),
    );

    const contentSlot = computed(() => {
      return (
        <>
          {props.showArrow && <div part="arrow" ref={arrowRef} style={arrowStyles.value} class={ns.e('arrow')}></div>}
          <slot name="pop-content">
            {props.content && <VCustomRenderer {...pick(props, ['content', 'preferHtml'])} type={props.contentType} />}
          </slot>
        </>
      );
    });

    const getRootClass = (type: string) => [
      props.variant === 'styleless' ? null : ns.t,
      ns.is(type),
      ns.is(`placement-${actualPlacement.value}`),
    ];

    const fixed = computed(() => {
      const { value } = type;
      const result = (
        <div
          {...popContentHandler}
          part={(value === 'teleport' ? 'teleport-fixed' : 'fixed') + ' pop-content'}
          style={finalFloatingStyles.value}
          v-show={isOpen.value}
          ref={fixedRef}
          class={getRootClass('fixed')}
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
          v-show={isOpen.value}
          style={finalFloatingStyles.value}
          part="popover pop-content"
          popover="manual"
          ref={popRef}
          class={getRootClass('popover')}
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
        isShow.value = false;
        emit('afterClose');
      },
    };

    return () => {
      const { value } = type;
      return (
        <>
          <Transition {...getTransitionProps(props)} {...transitionHandler}>
            {value === 'popover' ? popover.value : fixed.value}
          </Transition>
          <slot {...targetHandler} ref={slotRef}></slot>
        </>
      );
    };
  },
});

export type tPopover = typeof Popover;

export const definePopover = createDefineElement(name, Popover);
