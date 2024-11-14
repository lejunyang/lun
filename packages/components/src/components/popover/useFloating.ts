import type {
  InlineOptions,
  MiddlewareData,
  ReferenceElement,
  Derivable,
  FlipOptions,
  ShiftOptions,
  ElementRects,
  AutoUpdateOptions,
} from '@floating-ui/dom';
import { autoUpdate, computePosition } from '@floating-ui/vue';
import { computed, CSSProperties, onMounted, ref, shallowReadonly, shallowRef, unref, watch, watchEffect } from 'vue';
import type { UseFloatingOptions } from '@floating-ui/vue';
import {
  offset as pluginOffset,
  shift as pluginShift,
  inline as pluginInline,
  flip as pluginFlip,
  limitShift,
} from '@floating-ui/vue';
import { getCachedComputedStyle, getDPR, isFunction, roundByDPR, toPxIfNum } from '@lun-web/utils';
import { MaybeRefLikeOrGetter, unrefOrGet, useCleanUp, VirtualElement } from '@lun-web/core';
import { referenceRect } from './floating.store-rects';
import { insetReverseMap } from './popover.anchor-position';

/**
 * derived from @floating-ui/vue, made some changes
 * Computes the `x` and `y` coordinates that will place the floating element next to a reference element when it is given a certain CSS positioning strategy.
 * @param reference The reference template ref.
 * @param floating The floating template ref.
 * @param options The floating options.
 * @see https://floating-ui.com/docs/vue
 */
export function useFloating(
  reference: MaybeRefLikeOrGetter<Element | VirtualElement>,
  floating: MaybeRefLikeOrGetter<HTMLElement>,
  arrow: MaybeRefLikeOrGetter<HTMLElement>,
  options: Omit<UseFloatingOptions<ReferenceElement>, 'whileElementsMounted' | 'middleware'> & {
    off?: MaybeRefLikeOrGetter<boolean>;
    offset?: MaybeRefLikeOrGetter<number | string>;
    flip?: boolean | FlipOptions | Derivable<FlipOptions>;
    shift?: boolean | ShiftOptions | Derivable<ShiftOptions>;
    inline?: boolean | InlineOptions | Derivable<InlineOptions>;
    arrowPosition?: 'start' | 'end' | 'center' | 'auto';
    arrowOffset?: number | string;
    externalRects?: ElementRects;
    noAutoUpdate?: boolean;
    autoUpdateOptions?: AutoUpdateOptions;
  },
) {
  const { off, externalRects } = options;
  const openOption = computed(() => unref(options.open) ?? true);
  const placementOption = computed(() => unrefOrGet(options.placement) ?? 'bottom');
  const strategyOption = computed(() => unrefOrGet(options.strategy) ?? 'absolute');
  const transformOption = computed(() => unrefOrGet(options.transform) ?? true);

  // offset can not be computed, because it depends on offsetWidth(display: none)
  const getOffset = () => {
    const el = unrefOrGet(arrow);
    // when it's css anchor position, offset is called and cached in computed(at that time offsetWidth is 0), need to use computedStyle instead
    const arrowLen = !el ? 0 : el.offsetWidth || +getCachedComputedStyle(el).width.slice(0, -2);
    // const arrowLen = value && isShow.value ? value.offsetWidth : 0;
    // Get half the arrow box's hypotenuse length as the offset, since it has rotated 45 degrees
    // 取正方形的对角线长度的一半作为floating偏移量，因为它旋转了45度
    const floatingOffset = Math.sqrt(2 * arrowLen ** 2) / 2;
    return floatingOffset + (+unrefOrGet(options.offset)! || 0);
  };
  const middleware = computed(() => {
    const { shift, flip, inline } = options;
    return [
      inline && pluginInline(Object(inline)),
      flip && pluginFlip(Object(flip)),
      shift &&
        pluginShift(
          isFunction(shift)
            ? shift
            : {
                // shift will happen even if anchor target is out of view, use limiter to prevent that
                limiter: limitShift({
                  offset: ({ rects }) => rects.reference.width,
                }),
                ...(shift as any),
              },
        ),
      pluginOffset(getOffset),
      referenceRect(),
    ].filter(Boolean) as any;
  });

  const x = ref(0),
    y = ref(0);
  const strategy = ref(strategyOption.value),
    placement = ref(placementOption.value);
  const middlewareData = shallowRef<MiddlewareData>({});
  const isPositioned = ref(false);

  // ------------------------------ arrow style ------------------------------
  const placementInfo = computed(() => {
    const [side, align] = (unrefOrGet(placement) || 'bottom').split('-'),
      // if side is top or bottom, the arrow's position needs to be inline; otherwise, it's block
      inline = side === 'top' || side === 'bottom';
    return [side, align, inline ? 'inline-' : 'block-', inline ? 'width' : 'height', inline ? 'x' : 'y'] as const;
  });
  const defaultSize = { width: Infinity, height: Infinity };
  const getArrowStyle = (externalRects?: ElementRects) => {
    const arrowSize = unrefOrGet(arrow)?.offsetWidth || 0;
    const [side, align, insetMid, sizeProp, axis] = placementInfo.value;
    const { arrowPosition, arrowOffset } = options;
    const { shift, rects } = middlewareData.value;
    const { reference, floating } = rects || externalRects || { reference: defaultSize, floating: defaultSize };
    const shiftSize = shift?.[axis];
    const isAuto = arrowPosition === 'auto' || !arrowPosition,
      isCenter = arrowPosition === 'center' || (isAuto && !align),
      finalAlign = isCenter || isAuto ? align || 'start' : arrowPosition,
      insetAlign = 'inset-' + insetMid + finalAlign;
    let finalArrowOffset =
      isAuto && !isCenter
        ? Math.min(+arrowOffset!, (reference[sizeProp] - arrowSize) / 2, (floating[sizeProp] - arrowSize) / 2)
        : arrowOffset;
    if ((finalArrowOffset as number) < 0) finalArrowOffset = arrowOffset;
    return {
      position: 'absolute',
      [insetAlign]: isCenter ? '50%' : toPxIfNum(finalArrowOffset),
      [side]: '100%',
      [insetReverseMap[side]]: '', // must set empty value for the other side. because 'flip' can happen, side can change to top from bottom. due to vue style update logic, original 'bottom' will not be removed unless we specify it
      transform: isCenter
        ? `translate${axis.toUpperCase()}(${shiftSize ? `calc(-50% + (${-shiftSize}px))` : '-50%'})`
        : '',
    } satisfies CSSProperties;
  };
  // watch and update style of arrow element
  watchEffect(() => {
    const el = unrefOrGet(arrow);
    if (!el) return;
    Object.assign(el.style, getArrowStyle(externalRects));
  });
  // ------------------------------ arrow style ------------------------------

  const floatingStyles = computed(() => {
    const initialStyles = {
      position: strategy.value,
      left: '0',
      top: '0',
    };
    const float = unrefOrGet(floating) as Element;
    if (!float) {
      return initialStyles;
    }

    const xVal = roundByDPR(x.value, float);
    const yVal = roundByDPR(y.value, float);

    if (transformOption.value) {
      return {
        ...initialStyles,
        transform: `translate(${xVal}px, ${yVal}px)`,
        ...(getDPR(float) >= 1.5 && { willChange: 'transform' }),
      };
    }

    return {
      position: strategy.value,
      left: `${xVal}px`,
      top: `${yVal}px`,
    };
  });

  function update() {
    const floatEl = unrefOrGet(floating),
      refEl = unrefOrGet(reference);
    if (!floatEl || !refEl) {
      return;
    }
    computePosition(refEl, floatEl, {
      middleware: unrefOrGet(middleware),
      placement: placementOption.value,
      strategy: strategyOption.value,
    }).then((position) => {
      x.value = position.x;
      y.value = position.y;
      strategy.value = position.strategy;
      placement.value = position.placement;
      middlewareData.value = position.middlewareData;
      isPositioned.value = true;
    });
  }

  const [addClean, cleanUp] = useCleanUp();

  function attach() {
    cleanUp();
    if (unrefOrGet(off)) return;

    if (options.noAutoUpdate) {
      update();
      return;
    }
    const floatEl = unrefOrGet(floating),
      refEl = unrefOrGet(reference);

    if (refEl && floatEl) {
      addClean(autoUpdate(refEl, floatEl, update, options.autoUpdateOptions));
    }
  }

  function reset() {
    if (!openOption.value) {
      isPositioned.value = false;
    }
  }

  const watchOption = {
    flush: 'sync' as const,
  };
  watch([middleware, placementOption, strategyOption], update, watchOption);
  onMounted(() => watchEffect(attach, watchOption));
  watch(openOption, reset, watchOption);

  return {
    x: shallowReadonly(x),
    y: shallowReadonly(y),
    strategy: shallowReadonly(strategy),
    middlewareData: shallowReadonly(middlewareData),
    isPositioned: shallowReadonly(isPositioned),
    floatingStyles,
    update,
    placement,
    getOffset,
    placementInfo,
  };
}
