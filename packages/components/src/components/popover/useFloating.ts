import type { MiddlewareData, Placement, ReferenceElement } from '@floating-ui/dom';
import { computePosition } from '@floating-ui/vue';
import {
  computed,
  Ref,
  ref,
  shallowReadonly,
  shallowRef,
  unref,
  watch,
  watchEffect,
} from 'vue';
import type { UseFloatingOptions, UseFloatingReturn } from '@floating-ui/vue';
import { getDPR, roundByDPR } from '@lun/utils';
import { MaybeRefLikeOrGetter, tryOnScopeDispose, unrefOrGet, VirtualElement } from '@lun/core';

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
  options: UseFloatingOptions<ReferenceElement> & {
    off?: MaybeRefLikeOrGetter<boolean>;
    actualPlacement?: Ref<Placement | undefined>;
  },
): Omit<UseFloatingReturn, 'placement'> {
  const { whileElementsMounted, off, middleware, actualPlacement } = options;
  const openOption = computed(() => unref(options.open) ?? true);
  const placementOption = computed(() => unrefOrGet(options.placement) ?? 'bottom');
  const strategyOption = computed(() => unrefOrGet(options.strategy) ?? 'absolute');
  const transformOption = computed(() => unrefOrGet(options.transform) ?? true);
  const x = ref(0);
  const y = ref(0);
  const strategy = ref(strategyOption.value);
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
      middleware: unrefOrGet(middleware),
      placement: placementOption.value,
      strategy: strategyOption.value,
    }).then((position) => {
      x.value = position.x;
      y.value = position.y;
      strategy.value = position.strategy;
      if (actualPlacement) actualPlacement.value = position.placement;
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

  const watchOption = {
    flush: 'sync' as const,
  };
  watch([middleware, placementOption, strategyOption], update, watchOption);
  watchEffect(attach, watchOption);
  watch(openOption, reset, watchOption);

  tryOnScopeDispose(cleanup);

  return {
    x: shallowReadonly(x),
    y: shallowReadonly(y),
    strategy: shallowReadonly(strategy),
    middlewareData: shallowReadonly(middlewareData),
    isPositioned: shallowReadonly(isPositioned),
    floatingStyles,
    update,
  };
}
