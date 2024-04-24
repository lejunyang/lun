import { defineSSRCustomElement } from 'custom';
import { CSSProperties, computed, ref, toRef, watchEffect, Transition, BaseTransitionProps } from 'vue';
import { MaybeRefLikeOrGetter, refLikeToDescriptors, unrefOrGet, usePopover } from '@lun/core';
import { createDefineElement, toUnrefGetterDescriptors } from 'utils';
import { popoverEmits, popoverProps } from './type';
import { isElement, isFunction, objectKeys, runIfFn, virtualGetMerge } from '@lun/utils';
import { useCEExpose, useNamespace, useShadowDom } from 'hooks';
import { VCustomRenderer } from '../custom-renderer/CustomRenderer';
import {
  autoUpdate,
  arrow,
  offset as pluginOffset,
  ElementRects,
  shift as pluginShift,
  inline as pluginInline,
  useFloating,
} from '@floating-ui/vue';
import { referenceRect } from './floating.store-rects';
import { getTransitionProps, popSupport } from 'common';
import { defineTeleportHolder, useTeleport } from '../teleport-holder';
import { useContextConfig } from 'config';
import { virtualParentMap } from '../../custom/virtualParent';
// import { useFloating } from './useFloating';

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
      /** pop content element when type=position or teleport */ positionedRef = ref<HTMLDivElement>(),
      arrowRef = ref();
    const type = computed(() => {
      if (popSupport[props.type!]) return props.type!;
      else return objectKeys(popSupport).find((i) => popSupport[i])!;
    });
    const isTeleport = () => type.value === 'teleport',
      isTopLayer = () => type.value === 'popover';

    const contextZIndex = useContextConfig('zIndex');
    const shadow = useShadowDom();
    const [wrapTeleport, vnodeHandlers] = useTeleport(props, isTeleport);

    /** actual pop content element ref */
    const actualPop = computed(() => popRef.value || positionedRef.value);
    const propVirtualTarget = computed(() => {
      const target = unrefOrGet(props.target);
      return isFunction(target?.getBoundingClientRect) ? target : null;
    });
    const innerTarget = computed(() => {
      return propVirtualTarget.value || shadow.CE; // originally use slotRef.value, but found that when pointerTarget is coord, pop shows on pointer coordinates(maybe this covers something and causes difference, adding offset will work), click event will bubble from CE, not from slot
    });
    const actualTarget = computed(() => virtualTarget.value || activeExtraTarget.value || innerTarget.value);

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
      virtualTarget,
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
            const p = positionedRef.value;
            if (popover) popover.showPopover();
            return !!(popover || p);
          },
          target: innerTarget,
          pop: actualPop,
          onPopContentClose(e: Event) {
            // it's for nested type=teleport popover
            // if pop content is about to close, dispatch the event to its virtual parent, so that its parent can handle the event to determine to close or not
            const vParent = virtualParentMap.get(e.target as HTMLElement);
            if (vParent) vParent.dispatchEvent(e);
          },
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

    const strategy = toRef(props, 'strategy');
    const {
      floatingStyles,
      middlewareData,
      update,
      placement: actualPlacement,
      isPositioned,
    } = useFloating(currentTarget, actualPop as any, {
      whileElementsMounted: (...args) => {
        return autoUpdate(...args, props.autoUpdateOptions);
      },
      strategy,
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
      let result: CSSProperties = {
        ...floatingStyles.value,
        zIndex: zIndex ?? contextZIndex.popover,
      };
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
      },
      {
        ...toUnrefGetterDescriptors(options, {
          open: 'delayOpenPopover',
          close: 'delayClosePopover',
          openNow: 'openPopover',
          closeNow: 'closePopover',
          toggleNow: 'togglePopover',
        }),
        ...refLikeToDescriptors({
          isOpen,
          isShow,
          currentTarget,
          isTopLayer,
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
    const prevent = (e: Event) => e.preventDefault();
    const getContent = () => {
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
          {props.showArrow && (
            <div
              part={ns.p('arrow')}
              ref={arrowRef}
              // always prevent it for pointerTarget=coord, trigger=contextmenu
              onContextmenu={prevent}
              style={arrowStyles.value}
              class={ns.e('arrow')}
            ></div>
          )}
          {!contentNode && !isTeleport() ? <slot name="pop-content" /> : contentNode}
        </>
      );
    };

    const getPositionContent = () => {
      let { value } = strategy;
      value ||= 'absolute';
      const result = wrapTransition(
        <div
          {...popContentHandlers}
          part={isTeleport() ? '' : ns.p([value, 'content'])}
          style={finalFloatingStyles.value}
          v-show={isOpen.value}
          ref={positionedRef}
          class={getRootClass(value)}
          {...vnodeHandlers}
        >
          {getContent()}
        </div>,
      );
      return wrapTeleport(result);
    };

    const transitionHandler = {
      onEnter() {
        emit('open');
      },
      onAfterEnter(el) {
        // it's for transition; transition should only be set when entered, or initial left/top change can cause unexpected shift
        (el as HTMLElement).classList.add(ns.is('entered'));
        emit('afterOpen');
      },
      onBeforeLeave(el) {
        (el as HTMLElement).classList.remove(ns.is('entered'));
      },
      onLeave() {
        emit('close');
      },
      onAfterLeave() {
        popRef.value?.hidePopover();
        isShow.value = false;
        emit('afterClose');
      },
    } satisfies BaseTransitionProps;

    const wrapTransition = (node: any) => (
      <Transition {...getTransitionProps(props)} {...transitionHandler}>
        {node}
      </Transition>
    );

    return () => {
      return (
        <>
          {isTopLayer()
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
            : getPositionContent()}
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
  updatePosition: () => void;
  attachTarget(target?: Element | undefined, options?: { isDisabled?: MaybeRefLikeOrGetter<boolean> }): void;
  detachTarget(target?: Element | undefined): void;
  detachAll(): void;
  delayOpenPopover: () => void;
  /**
   * @param ensure delayed close may be canceled if delayOpenPopover is invoked. if ensure is true, it will not be canceled
   */
  delayClosePopover: (ensure?: boolean) => void;
  openPopover: () => void;
  closePopover: () => void;
  readonly currentTarget: any;
  readonly isTopLayer: boolean;
  readonly isOpen: boolean;
  readonly isShow: boolean;
};

export const definePopover = createDefineElement(name, Popover, {
  'teleport-holder': defineTeleportHolder,
});
