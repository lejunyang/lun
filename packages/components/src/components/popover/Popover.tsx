import { defineSSRCustomElement } from 'custom';
import { CSSProperties, computed, ref, toRef, watchEffect, Transition } from 'vue';
import { MaybeRefLikeOrGetter, refLikeToDescriptors, unrefOrGet, usePopover } from '@lun/core';
import { createDefineElement, toGetterDescriptors } from 'utils';
import { popoverEmits, popoverProps } from './type';
import { isElement, isFunction, objectKeys, runIfFn, virtualGetMerge } from '@lun/utils';
import { useCEExpose, useNamespace, useShadowDom } from 'hooks';
import { VCustomRenderer } from '../custom-renderer/CustomRenderer';
import {
  autoUpdate,
  useFloating,
  arrow,
  offset as pluginOffset,
  ElementRects,
  shift as pluginShift,
  inline as pluginInline,
} from '@floating-ui/vue';
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
    const /** pop content element with type=popover */ popRef = ref<HTMLDivElement>(),
      slotRef = ref<HTMLSlotElement>(),
      /** pop content element when type=fixed or teleport fixed */ fixedRef = ref<HTMLDivElement>(),
      arrowRef = ref();
    const type = computed(() => {
      if (popSupport[props.type!]) return props.type;
      else return objectKeys(popSupport).find((i) => popSupport[i]);
    });
    const contextZIndex = useContextConfig('zIndex');
    const wrapTeleport = useTeleport(props);

    const shadow = useShadowDom();
    /** actual pop content element ref */
    const actualPop = computed(() => popRef.value || fixedRef.value);
    const virtualTarget = computed(() => {
      const target = unrefOrGet(props.target);
      return isFunction(target?.getBoundingClientRect) ? target : null;
    });
    const innerTarget = computed(() => {
      return virtualTarget.value || slotRef.value;
    });
    const actualTarget = computed(() => range.value || activeExtraTarget.value || virtualTarget.value || shadow.CE);

    /** current popover target */
    const currentTarget = computed(() =>
      // avoid update float position when not show
      isOpen.value || isShow.value ? actualTarget.value : null,
    );

    const {
      targetHandlers,
      popContentHandlers,
      options,
      activeExtraTarget,
      methods,
      range,
      isOpen,
      isShow,
      isClosing,
    } = usePopover(
      virtualGetMerge(
        {
          beforeOpen() {
            return runIfFn(props.beforeOpen, actualTarget.value);
          },
          onOpen() {
            const popover = popRef.value;
            const fixed = fixedRef.value;
            if (popover) popover.showPopover();
            return !!(popover || fixed);
          },
          target: innerTarget,
          pop: actualPop,
        },
        props,
      ),
    );

    const placement = toRef(props, 'placement');
    const middleware = computed(() => {
      const { shift, showArrow, inline, offset } = props;
      return [
        // selection range needs inline
        (inline || options.value.triggers.has('select')) && pluginInline(Object(inline)),
        shift && pluginShift(Object(shift)),
        // type.value === 'popover' && topLayerOverTransforms(), // it's already been fixed by floating-ui
        pluginOffset(() => {
          const arrowLen = arrowRef.value?.offsetWidth || 0;
          // Get half the arrow box's hypotenuse length as the offset, since it has rotated 45 degrees
          // 取正方形的对角线长度的一半作为floating偏移量，因为它旋转了45度
          const floatingOffset = Math.sqrt(2 * arrowLen ** 2) / 2;
          return floatingOffset + (+offset! || 0);
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
    } = useFloating(currentTarget, actualPop as any, {
      whileElementsMounted: (...args) => {
        return autoUpdate(...args, {
          // TODO add props
          // elementResize: false, // 这个也会影响target的resize， select需要同步target的宽度
        });
      },
      strategy: 'fixed',
      placement,
      open: isOpen,
      middleware,
      transform: toRef(props, 'useTransform'),
    });

    // make virtual target auto update
    watchEffect(() => {
      const target = unrefOrGet(props.target);
      // have getBoundingClientRect but not a element, it's virtual
      if (isFunction(target?.getBoundingClientRect) && !isElement(target)) {
        target?.getBoundingClientRect(); // collect dep
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
        updatePosition: update,
        ...methods,
        get currentTarget() {
          return currentTarget.value;
        },
      },
      {
        ...toGetterDescriptors(options, {
          open: 'delayOpenPopover',
          close: 'delayClosePopover',
          openNow: 'openPopover',
          closeNow: 'closePopover',
          toggleNow: 'togglePopover',
        }),
        ...refLikeToDescriptors({
          isOpen,
          isShow,
        }),
      },
    );

    const getRootClass = (type: string) => [
      props.rootClass,
      props.variant === 'styleless' ? null : ns.t,
      ns.is(type),
      ns.is(`placement-${actualPlacement.value}`),
      ns.is(`side-${actualPlacement.value?.split('-')[0]}`),
    ];

    let cacheContent: any;
    const getContent = (wrapSlot = true) => {
      const { content, contentType, preferHtml, freezeWhenClosing } = props;
      let finalContent: any;
      const contentNode =
        freezeWhenClosing && isClosing.value
          ? cacheContent
          : (cacheContent = (finalContent = runIfFn(content, currentTarget.value)) && (
              <VCustomRenderer content={finalContent} preferHtml={preferHtml} type={contentType} />
            ));
      return (
        <>
          {props.showArrow && <div part="arrow" ref={arrowRef} style={arrowStyles.value} class={ns.e('arrow')}></div>}
          {wrapSlot && !contentNode ? <slot name="pop-content"></slot> : contentNode}
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
            {runIfFn(props.defaultChildren, { isOpen: isOpen.value, isShow: isShow.value })}
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
  attachTarget(target?: Element | undefined, options?: { isDisabled?: MaybeRefLikeOrGetter<boolean> }): void;
  detachTarget(target?: Element | undefined): void;
  detachAll(): void;
  readonly currentTarget: any;
  delayOpenPopover: () => void;
  /**
   * @param ensure delayed close may be canceled if delayOpenPopover is invoked. if ensure is true, it will not be canceled
   */
  delayClosePopover: (ensure?: boolean) => void;
  openPopover: () => void;
  closePopover: () => void;
};

export const definePopover = createDefineElement(name, Popover, {
  'teleport-holder': defineTeleportHolder,
});
