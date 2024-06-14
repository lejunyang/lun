import { defineSSRCustomElement } from 'custom';
import {
  CSSProperties,
  computed,
  ref,
  toRef,
  watchEffect,
  Transition,
  BaseTransitionProps,
  getCurrentInstance,
  reactive,
  nextTick,
  watchPostEffect,
} from 'vue';
import { MaybeRefLikeOrGetter, refLikeToDescriptors, unrefOrGet, unrefOrGetMulti, usePopover } from '@lun/core';
import { createDefineElement } from 'utils';
import { popoverEmits, popoverProps } from './type';
import {
  getCachedComputedStyle,
  isElement,
  isFunction,
  objectKeys,
  prevent,
  runIfFn,
  toGetterDescriptors,
  toPxIfNum,
  virtualGetMerge,
} from '@lun/utils';
import { useCEExpose, useNamespace } from 'hooks';
import { VCustomRenderer } from '../custom-renderer/CustomRenderer';
import {
  autoUpdate,
  offset as pluginOffset,
  shift as pluginShift,
  inline as pluginInline,
  ElementRects,
} from '@floating-ui/vue';
import { referenceRect } from './floating.store-rects';
import { getTransitionProps, popSupport } from 'common';
import { defineTeleportHolder, useTeleport } from '../teleport-holder';
import { useContextConfig } from 'config';
import { virtualParentMap } from '../../custom/virtualParent';
import { processPopSize, useAnchorPosition } from './popover.anchor-position';
import { useFloating } from './useFloating';

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
      arrowRef = ref<HTMLElement>();
    const type = computed(() => {
      if (popSupport[props.type!]) return props.type!;
      else return objectKeys(popSupport).find((i) => popSupport[i])!;
    });
    const isTeleport = () => type.value === 'teleport',
      isTopLayer = () => type.value === 'popover';

    const contextZIndex = useContextConfig('zIndex');
    const { CE } = getCurrentInstance()!;
    const [wrapTeleport, vnodeHandlers] = useTeleport(props, isTeleport);

    /** actual pop content element ref */
    const actualPop = computed(() => unrefOrGetMulti(popRef, positionedRef));
    const propVirtualTarget = computed(() => {
      const target = unrefOrGet(props.target);
      return isFunction(target?.getBoundingClientRect) ? target : null;
    });
    const innerTarget = computed(() => {
      return propVirtualTarget.value || CE; // originally use slotRef.value, but found that when pointerTarget is coord, pop shows on pointer coordinates(maybe this covers something and causes difference, adding offset will work), click event will bubble from CE, not from slot
    });
    const actualTarget = computed(() => unrefOrGetMulti(virtualTarget, activeExtraTarget, innerTarget));

    /** current popover target */
    const currentTarget = computed(() =>
      // avoid update float position when not show
      unrefOrGetMulti(isOpen, isShow) ? actualTarget.value : null,
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
            if (vParent) vParent.dispatchEvent(new Event(e.type, { bubbles: true })); // bubbles must be true
          },
        },
        props,
      ),
    );

    const placement = toRef(props, 'placement');
    const actualPlacement = ref(placement.value || 'bottom');
    // offset can not be computed, because it depends on offsetWidth(display: none)
    const offset = () => {
      const { value } = arrowRef;
      // when it's css anchor position, offset is called and cached in computed(at that time offsetWidth is 0), need to use computedStyle instead
      const arrowLen = !value ? 0 : value.offsetWidth || +getCachedComputedStyle(value).width.slice(0, -2);
      // const arrowLen = value && isShow.value ? value.offsetWidth : 0;
      // Get half the arrow box's hypotenuse length as the offset, since it has rotated 45 degrees
      // 取正方形的对角线长度的一半作为floating偏移量，因为它旋转了45度
      const floatingOffset = Math.sqrt(2 * arrowLen ** 2) / 2;
      return floatingOffset + (+props.offset! || 0);
    };
    const middleware = computed(() => {
      const { shift, inline } = props;
      return [
        // selection range needs inline
        (inline || options.triggers.has('select')) && pluginInline(Object(inline)),
        shift && pluginShift(Object(shift)),
        // type.value === 'popover' && topLayerOverTransforms(), // it's already been fixed by floating-ui
        pluginOffset(offset),
        referenceRect(),
      ].filter(Boolean) as any;
    });

    const strategy = toRef(props, 'strategy');
    const { isOn, popStyle, arrowStyle, render } = useAnchorPosition(
      virtualGetMerge(
        {
          name: () => {
            const { value } = actualTarget;
            if (value === CE) {
              const { anchorName } = props;
              return anchorName && '--' + anchorName;
            } else if (isElement(value)) {
              // @ts-ignore
              const { anchorName } = getCachedComputedStyle(value);
              // anchorName defaults to none
              return (anchorName as string)?.startsWith('--') && anchorName;
            }
          },
          inner: () => actualTarget.value === CE,
          off: isTeleport, // disabled it for teleport because of CSS anchor position shadow tree limitation
          offset,
          placement: actualPlacement,
        },
        props,
      ),
    );

    /** when not using floating-ui, rectsInfo is used to store reference and floating's rects */
    const rectsInfo = reactive({
      reference: {},
      floating: {},
    }) as ElementRects;
    watchPostEffect(() => {
      if (isShow.value && isOn.value) {
        // need nextTick, or floating rect size could be 0
        nextTick(() => {
          const reference = actualTarget.value,
            floating = actualPop.value;
          if (reference && floating) {
            rectsInfo.reference = reference.getBoundingClientRect();
            rectsInfo.floating = floating.getBoundingClientRect();
          }
        });
      }
    });

    const { floatingStyles, middlewareData, update, isPositioned } = useFloating(currentTarget, actualPop as any, {
      whileElementsMounted: (...args) => {
        return autoUpdate(...args, props.autoUpdateOptions);
      },
      strategy,
      placement,
      actualPlacement,
      open: isOpen,
      middleware,
      transform: toRef(props, 'useTransform'),
      off: () => !!isOn.value,
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

    const finalFloatingStyles = computed(() => {
      const rect = middlewareData.value.rects?.reference || {};
      const { adjustPopStyle, zIndex, popWidth, popHeight } = props;
      let result: CSSProperties = {
        ...popStyle(
          {
            width: toPxIfNum(rect[processPopSize(popWidth) as keyof typeof rect] || popWidth),
            height: toPxIfNum(rect[processPopSize(popHeight) as keyof typeof rect] || popHeight),
            ...floatingStyles.value,
          },
          popWidth,
          popHeight,
        ),
        zIndex: zIndex ?? contextZIndex.popover,
      };
      result = runIfFn(adjustPopStyle, result, middlewareData.value) || result;
      return result;
    });

    // watch and update style of arrow element
    watchEffect(() => {
      const { value } = arrowRef;
      if (!value) return;
      const { rects } = middlewareData.value;
      Object.assign(value.style, arrowStyle(value.offsetWidth, rects || rectsInfo));
    });

    // Already exist a prop `show`, so rename the methods, these will override native popover methods
    useCEExpose(
      {
        updatePosition: update,
        ...methods,
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
          currentTarget,
          actualTarget,
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
          {/* 
          why add isOpen.value || isShow.value here?
          because I found a possible chromium bug, when anchorName is truthy and popWidth(or popHeight) is anchorWidth, and then if showArrow is true, the browser will crash as soon as the page loads(error code: STATUS_BREAKPOINT, version: 125)
          I have no idea why that happens
          but not rendering arrow element initially seems to be a workaround
          */}
          {props.showArrow && (isOpen.value || isShow.value) && (
            <div
              part={ns.p('arrow')}
              ref={arrowRef}
              // always prevent it for pointerTarget=coord, trigger=contextmenu
              onContextmenu={prevent}
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
          {render()}
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
