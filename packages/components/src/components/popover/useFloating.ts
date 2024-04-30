import type { MiddlewareData, ReferenceElement } from '@floating-ui/dom';
import { computePosition } from '@floating-ui/dom';
import {
  computed,
  getCurrentScope,
  onScopeDispose,
  ref,
  shallowReadonly,
  shallowRef,
  unref,
  watch,
  watchEffect,
} from 'vue';

import type { UseFloatingOptions, UseFloatingReturn } from '@floating-ui/vue';
import { getCachedComputedStyle, getDPR, getWindow, roundByDPR } from '@lun/utils';
import { MaybeRefLikeOrGetter, unrefOrGet, VirtualElement } from '@lun/core';
import { platform } from '@floating-ui/dom';
import { isLunComponent } from 'utils';
import { getContainingBlock } from '@floating-ui/utils/dom';

/**
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
  options: UseFloatingOptions<ReferenceElement> = {},
): UseFloatingReturn {
  const whileElementsMountedOption = options.whileElementsMounted;
  const openOption = computed(() => unref(options.open) ?? true);
  const middlewareOption = computed(() => unref(options.middleware));
  const placementOption = computed(() => unref(options.placement) ?? 'bottom');
  const strategyOption = computed(() => unref(options.strategy) ?? 'absolute');
  const transformOption = computed(() => unref(options.transform) ?? true);
  const x = ref(0);
  const y = ref(0);
  const strategy = ref(strategyOption.value);
  const placement = ref(placementOption.value);
  const middlewareData = shallowRef<MiddlewareData>({});
  const isPositioned = ref(false);
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

  let whileElementsMountedCleanup: (() => void) | undefined;

  function update() {
    const floatEl = unrefOrGet(floating),
      refEl = unrefOrGet(reference);
    if (!floatEl || !refEl) {
      return;
    }

    const original = platform.getOffsetParent;
    computePosition(refEl, floatEl, {
      middleware: middlewareOption.value,
      placement: placementOption.value,
      strategy: strategyOption.value,
      platform: {
        ...platform,
        getOffsetParent: (el) => {
          if (el === unrefOrGet(arrow)) return original(el);
          const elStyle = getCachedComputedStyle(el),
            elWindow = getWindow(el);
          if (elStyle.position === 'fixed') {
            return getContainingBlock(el) || elWindow;
          }
          const parent = (el.getRootNode() as ShadowRoot).host;
          // special logic for popover
          if (parent && isLunComponent(parent, 'popover')) {
            if ((parent as any).isTopLayer) return elWindow;
            const { position } = getCachedComputedStyle(parent);
            if (position !== 'fixed' && position !== 'static') {
              return parent;
            }
          }
          return original(el);
        },
      },
    }).then((position) => {
      x.value = position.x;
      y.value = position.y;
      strategy.value = position.strategy;
      placement.value = position.placement;
      middlewareData.value = position.middlewareData;
      isPositioned.value = true;
    });
  }

  function cleanup() {
    if (typeof whileElementsMountedCleanup === 'function') {
      whileElementsMountedCleanup();
      whileElementsMountedCleanup = undefined;
    }
  }

  function attach() {
    cleanup();

    if (whileElementsMountedOption === undefined) {
      update();
      return;
    }
    const floatEl = unrefOrGet(floating),
      refEl = unrefOrGet(reference);

    if (refEl && floatEl) {
      whileElementsMountedCleanup = whileElementsMountedOption(refEl, floatEl, update);
    }
  }

  function reset() {
    if (!openOption.value) {
      isPositioned.value = false;
    }
  }

  watch([middlewareOption, placementOption, strategyOption], update, {
    flush: 'sync',
  });
  watchEffect(attach, { flush: 'sync' });
  watch(openOption, reset, { flush: 'sync' });

  if (getCurrentScope()) {
    onScopeDispose(cleanup);
  }

  return {
    x: shallowReadonly(x),
    y: shallowReadonly(y),
    strategy: shallowReadonly(strategy),
    placement: shallowReadonly(placement),
    middlewareData: shallowReadonly(middlewareData),
    isPositioned: shallowReadonly(isPositioned),
    floatingStyles,
    update,
  };
}
