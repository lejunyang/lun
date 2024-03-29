import { defineSSRCustomElement } from 'custom';
import { CSSProperties, computed, ref, toRef, watchEffect, Transition } from 'vue';
import { unrefOrGet, usePopover } from '@lun/core';
import { createDefineElement, toGetterDescriptors } from 'utils';
import { popoverEmits, popoverProps } from './type';
import { isElement, isFunction, objectKeys, pick, runIfFn } from '@lun/utils';
import { useCEExpose, useNamespace, useShadowDom } from 'hooks';
import { VCustomRenderer } from '../custom-renderer/CustomRenderer';
import { autoUpdate, useFloating, arrow, offset, ElementRects, shift } from '@floating-ui/vue';
import { referenceRect } from './floating.store-rects';
import { getTransitionProps, popSupport } from 'common';
import { defineTeleportHolder, useTeleport } from '../teleport-holder';
import { useContextConfig } from 'config';

const name = 'popover';
export const Popover = defineSSRCustomElement({
  name,
  props: popoverProps,
  inheritAttrs: false,
  emits: popoverEmits,
  setup(props, { emit }) {
    const ns = useNamespace(name);
    const popRef = ref<HTMLDivElement>();
    const slotRef = ref<HTMLSlotElement>();
    const fixedRef = ref<HTMLDivElement>();
    const arrowRef = ref();
    const isOpen = ref(false);
    const isShow = ref(false); // after animation ends, it will be false
    const type = computed(() => {
      if (popSupport[props.type!]) return props.type;
      else return objectKeys(popSupport).find((i) => popSupport[i]);
    });
    const contextZIndex = useContextConfig('zIndex');
    const wrapTeleport = useTeleport(props);

    const show = () => {
      const { beforeOpen, disabled } = props;
      if (disabled || (isFunction(beforeOpen) && beforeOpen() === false)) return;
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
      if (props.disabled) return;
      options.value.cancelShowOrHide();
      const { value } = popRef;
      if (value) value.togglePopover(force);
      isOpen.value = force !== undefined ? force : !isOpen.value;
      if (isOpen.value) isShow.value = true;
    };

    const actualPopRef = computed(() => popRef.value || fixedRef.value);
    const virtualTarget = computed(() => {
      const target = unrefOrGet(props.target);
      return isFunction(target?.getBoundingClientRect) ? target : null;
    });
    const actualTargetRef = computed(() => {
      return virtualTarget.value || slotRef.value;
    });

    const { targetHandlers, popContentHandlers, options, activeTargetInExtra, methods } = usePopover(() => ({
      ...pick(props, ['openDelay', 'closeDelay', 'triggers', 'toggleMode']),
      manual: props.open !== undefined,
      isShow,
      show,
      hide,
      target: actualTargetRef,
      pop: actualPopRef,
    }));

    const shadow = useShadowDom();
    const ceRef = computed(() => (isOpen.value ? activeTargetInExtra.value || virtualTarget.value || shadow.CE : null)); // avoid update float position when not show
    const placement = toRef(props, 'placement');
    const middleware = computed(() => {
      const { shift: pShift, showArrow } = props;
      return [
        pShift && shift(pShift === true ? undefined : pShift),
        // type.value === 'popover' && topLayerOverTransforms(), // it's already been fixed by floating-ui
        offset(() => {
          const arrowLen = arrowRef.value?.offsetWidth || 0;
          // Get half the arrow box's hypotenuse length as the offset, since it has rotated 45 degrees
          // 取正方形的对角线长度的一半作为floating偏移量，因为它旋转了45度
          const floatingOffset = Math.sqrt(2 * arrowLen ** 2) / 2;
          return floatingOffset + (+props.offset! || 0);
        }),
        showArrow &&
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
      isPositioned,
    } = useFloating(ceRef, actualPopRef as any, {
      whileElementsMounted: (...args) => {
        return autoUpdate(...args, {
          // elementResize: false, // 这个也会影响target的resize， select需要同步target的宽度
        });
      },
      strategy: 'fixed',
      placement,
      open: isShow,
      middleware,
      transform: toRef(props, 'useTransform'),
    });

    // handle manual visibility control by external
    watchEffect(() => {
      if (props.open !== undefined) {
        if (props.open) show();
        else hide();
      }
    });

    watchEffect(() => {
      const target = unrefOrGet(props.target);
      // if target is a virtual element, watch it to auto update
      if (isFunction(target?.getBoundingClientRect) && !isElement(target)) {
        target?.getBoundingClientRect();
        if (isPositioned.value) update();
      }
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
        [staticSide]: `${-arrowRef.value?.offsetWidth}px`,
      };
    });

    const finalFloatingStyles = computed(() => {
      const { sync, adjustPopStyle, zIndex } = props;
      let result: CSSProperties = { ...floatingStyles.value, zIndex: zIndex ?? contextZIndex.popover };
      const { width, height } = (middlewareData.value.rects as ElementRects)?.reference || {};
      if (width && (sync === 'width' || sync === 'both')) result.width = `${width}px`;
      if (height && (sync === 'height' || sync === 'both')) result.height = `${height}px`;
      if (adjustPopStyle) result = adjustPopStyle(result, middlewareData.value) || result;
      return result;
    });

    // Already exist a prop `show`, so rename the methods, these will override native popover methods
    useCEExpose(
      {
        togglePopover: toggle,
        isOpen: () => (props.open !== undefined ? !!props.open : isOpen.value),
        updatePosition: update,
        ...methods,
      },
      toGetterDescriptors(options, {
        show: 'delayOpenPopover',
        hide: 'delayClosePopover',
        showNow: 'openPopover',
        hideNow: 'closePopover',
      }),
    );

    const getRootClass = (type: string) => [
      props.rootClass,
      props.variant === 'styleless' ? null : ns.t,
      ns.is(type),
      ns.is(`placement-${actualPlacement.value}`),
      ns.is(`side-${actualPlacement.value?.split('-')[0]}`),
    ];

    const getContent = (wrapSlot = true) => {
      const content = props.content && (
        <VCustomRenderer {...pick(props, ['content', 'preferHtml'])} type={props.contentType} />
      );
      return (
        <>
          {props.showArrow && <div part="arrow" ref={arrowRef} style={arrowStyles.value} class={ns.e('arrow')}></div>}
          {wrapSlot ? <slot name="pop-content">{content}</slot> : content}
        </>
      );
    };

    const getFixed = () => {
      const { value } = type;
      const isTeleport = value === 'teleport';
      const result = wrapTransition(
        <div
          {...popContentHandlers}
          part={isTeleport ? '' : 'fixed content'}
          style={finalFloatingStyles.value}
          v-show={isOpen.value}
          ref={fixedRef}
          class={getRootClass('fixed')}
        >
          {getContent(!isTeleport)}
        </div>,
      );
      return wrapTeleport(result, isTeleport);
    };

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

    const wrapTransition = (node: any) => (
      <Transition {...getTransitionProps(props)} {...transitionHandler}>
        {node}
      </Transition>
    );

    return () => {
      const { value } = type;
      return (
        <>
          {value === 'popover'
            ? wrapTransition(
                <div
                  {...popContentHandlers}
                  v-show={isOpen.value}
                  style={finalFloatingStyles.value}
                  part={ns.p(['native', 'content'])}
                  popover="manual"
                  ref={popRef}
                  class={getRootClass('popover')}
                >
                  {getContent()}
                </div>,
              )
            : getFixed()}
          <slot {...targetHandlers} ref={slotRef}>
            {runIfFn(props.children, { isOpen: isOpen.value, isShow: isShow.value })}
          </slot>
        </>
      );
    };
  },
});

export type tPopover = typeof Popover;
export type iPopover = InstanceType<tPopover> & {
  togglePopover: (force?: boolean) => void;
  isOpen: () => boolean;
  updatePosition: () => void;
  delayOpenPopover: () => void;
  delayClosePopover: () => void;
  openPopover: () => void;
  closePopover: () => void;
};

export const definePopover = createDefineElement(name, Popover, {
  'teleport-holder': defineTeleportHolder,
});
