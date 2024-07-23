import { defineSSRCustomElement } from 'custom';
import {
  CSSProperties,
  computed,
  ref,
  watchEffect,
  Transition,
  BaseTransitionProps,
  getCurrentInstance,
  reactive,
  nextTick,
  watchPostEffect,
} from 'vue';
import {
  MaybeRefLikeOrGetter,
  refLikeToDescriptors,
  unrefOrGet,
  unrefOrGetMulti,
  usePopover,
  useSetupEvent,
} from '@lun/core';
import { closePopover, createDefineElement, openPopover } from 'utils';
import { popoverEmits, popoverProps } from './type';
import {
  getCachedComputedStyle,
  isElement,
  objectKeys,
  prevent,
  runIfFn,
  toGetterDescriptors,
  toPxIfNum,
  virtualGetMerge,
  getRect,
} from '@lun/utils';
import { useCEExpose, useNamespace } from 'hooks';
import { VCustomRenderer } from '../custom-renderer/CustomRenderer';
import { ElementRects } from '@floating-ui/vue';
import { getCompParts, getTransitionProps, popSupport } from 'common';
import { defineTeleportHolder, useTeleport } from '../teleport-holder';
import { useContextConfig } from 'config';
import { virtualParentMap } from '../../custom/virtualParent';
import { processPopSize, useAnchorPosition } from './popover.anchor-position';
import { useFloating } from './useFloating';
import { hasRect } from './utils';

const name = 'popover';
const parts = ['content', 'native', 'arrow'] as const;
const compParts = getCompParts(name, parts);
export const Popover = defineSSRCustomElement({
  name,
  props: popoverProps,
  emits: popoverEmits,
  setup(props, { emit: e }) {
    const ns = useNamespace(name);
    const emit = useSetupEvent<typeof e>();
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
      return hasRect(target) ? target : null;
    });
    const innerTarget = computed(() => {
      return propVirtualTarget.value || CE; // originally use slotRef.value, but found that when pointerTarget is coord, pop shows on pointer coordinates(maybe this covers something and causes difference, adding offset will work), click event will bubble from CE, not from slot
    });

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
            const popover = popRef.value,
              p = positionedRef.value;
            openPopover(popRef);
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

    const actualTarget = computed(() => unrefOrGetMulti(virtualTarget, activeExtraTarget, innerTarget));
    /** current popover target */
    const currentTarget = computed(() =>
      // avoid update float position when not show
      unrefOrGetMulti(isOpen, isShow) ? actualTarget.value : null,
    );

    /** when not using floating-ui, rectsInfo is used to store reference and floating's rects */
    const rectsInfo = reactive({
      reference: {},
      floating: {},
    }) as ElementRects;

    const strategy = () => props.strategy || 'absolute';
    const { floatingStyles, middlewareData, update, isPositioned, placementInfo, getOffset, placement } = useFloating(
      currentTarget,
      actualPop as any,
      arrowRef,
      virtualGetMerge(
        {
          strategy,
          open: isOpen,
          transform: () => props.useTransform,
          off: () => !!isOn.value,
          externalRects: rectsInfo,
          get inline() {
            return props.inline || options.triggers.has('select');
          },
        },
        props,
      ),
    );

    const { isOn, popStyle, render } = useAnchorPosition(
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
          offset: getOffset,
          type,
          info: placementInfo,
        },
        props,
      ),
    );
    // update rects for anchor position
    watchPostEffect(() => {
      if (isShow.value && isOn.value) {
        // need nextTick, or floating rect size could be 0
        nextTick(() => {
          const reference = actualTarget.value,
            floating = actualPop.value;
          if (reference && floating) {
            rectsInfo.reference = getRect(reference);
            rectsInfo.floating = getRect(floating);
          }
        });
      }
    });

    // make virtual target auto update
    watchEffect(() => {
      const target = unrefOrGet(props.target);
      // have getBoundingClientRect but not a element, it's virtual
      if (hasRect(target) && !isElement(target)) {
        getRect(target as Element); // collect dep
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
      ns.is(`placement-${placement.value}`),
      ns.is(`side-${placement.value?.split('-')[0]}`),
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
              part={compParts[2]}
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
      const result = wrapTransition(
        <div
          {...popContentHandlers}
          part={isTeleport() ? '' : compParts[0]}
          style={finalFloatingStyles.value}
          v-show={isOpen.value}
          ref={positionedRef}
          class={getRootClass(unrefOrGet(strategy))}
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
        closePopover(popRef);
        isShow.value = false;
        emit('afterClose');
      },
    } satisfies BaseTransitionProps;

    const wrapTransition = (node: any) => (
      <Transition {...getTransitionProps(props, 'pop', 'fade')} {...transitionHandler}>
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
                  part={compParts[0] + ' ' + compParts[1]}
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
export type PopoverExpose = {
  openPopover: () => void;
  closePopover: () => void;
  togglePopover: (force?: boolean) => void;
  delayOpenPopover: () => void;
  /**
   * @param ensure delayed close may be canceled if delayOpenPopover is invoked. if ensure is true, it will not be canceled
   */
  delayClosePopover: (ensure?: boolean) => void;
  updatePosition: () => void;
  attachTarget(target?: Element | undefined, options?: { isDisabled?: MaybeRefLikeOrGetter<boolean> }): void;
  detachTarget(target?: Element | undefined): void;
  detachAll(): void;
  readonly currentTarget: any;
  readonly isTopLayer: boolean;
  readonly isOpen: boolean;
  readonly isShow: boolean;
};
export type iPopover = InstanceType<tPopover> & PopoverExpose;

export const definePopover = createDefineElement(
  name,
  Popover,
  {
    offset: 4,
    showArrow: true,
    useTransform: false,
    popWidth: 'max-content',
    arrowPosition: 'auto',
    arrowOffset: 15,
    // anchorName: 'popover',
  },
  parts,
  {
    'teleport-holder': defineTeleportHolder,
  },
);
