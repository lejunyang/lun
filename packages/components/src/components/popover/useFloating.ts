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
import { getDPR, roundByDPR } from '@lun/utils';
import { MaybeRefLikeOrGetter, unrefOrGet, VirtualElement } from '@lun/core';

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
  options: UseFloatingOptions<ReferenceElement> & { off?: MaybeRefLikeOrGetter<boolean> } = {},
): UseFloatingReturn {
  const { whileElementsMounted, off, middleware } = options;
  const openOption = computed(() => unref(options.open) ?? true);
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

    computePosition(refEl, floatEl, {
      middleware: unref(middleware),
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

  function cleanup() {
    if (typeof whileElementsMountedCleanup === 'function') {
      whileElementsMountedCleanup();
      whileElementsMountedCleanup = undefined;
    }
  }

  function attach() {
    cleanup();
    if (unrefOrGet(off)) return;

    if (!whileElementsMounted) {
      update();
      return;
    }
    const floatEl = unrefOrGet(floating),
      refEl = unrefOrGet(reference);

    if (refEl && floatEl) {
      whileElementsMountedCleanup = whileElementsMounted(refEl, floatEl, update);
    }
  }

  function reset() {
    if (!openOption.value) {
      isPositioned.value = false;
    }
  }

  watch([middleware, placementOption, strategyOption], update, {
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
