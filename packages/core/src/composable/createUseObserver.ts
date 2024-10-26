import { watchPostEffect } from 'vue';
import { MaybeRefLikeOrGetter, unrefOrGet } from '../utils';
import { isElement, isFunction, runIfFn, ensureArray } from '@lun/utils';
import { tryOnScopeDispose } from '../hooks';

type NamePrefixes = 'Mutation' | 'Intersection' | 'Resize';
type GetObserverType<N extends `${NamePrefixes}Observer`> = InstanceType<(typeof globalThis)[N]>;
type CallbackMap = {
  IntersectionObserver: IntersectionObserverCallback;
  MutationObserver: MutationCallback;
  ResizeObserver: ResizeObserverCallback;
};
type OptionsMap = {
  IntersectionObserver: {
    observerInit?: IntersectionObserverInit | (() => IntersectionObserverInit);
  };
  MutationObserver: {
    observeOptions?: MutationObserverInit | ((el: Element) => MutationObserverInit);
  };
  ResizeObserver: {
    observeOptions?: ResizeObserverOptions | ((el: Element) => ResizeObserverOptions);
  };
};

export function createUseObserver<
  NP extends NamePrefixes,
  N extends `${NP}Observer` = `${NP}Observer`,
  O extends GetObserverType<N> = GetObserverType<N>,
>(namePrefix: NP) {
  const name = (namePrefix + 'Observer') as N;
  return ({
    targets,
    callback,
    // @ts-expect-error
    observerInit,
    // @ts-expect-error
    observeOptions,
    disabled,
    window = globalThis,
  }: {
    targets: MaybeRefLikeOrGetter<Element | null | undefined | (Element | null | undefined)[]>;
    disabled?: MaybeRefLikeOrGetter<boolean>;
    callback: CallbackMap[N];
    window?: typeof globalThis;
  } & OptionsMap[N]) => {
    let observer: O | undefined,
      supported = isFunction(globalThis[name]),
      stopWatch: ReturnType<typeof watchPostEffect>;
    const clean = () => {
      if (observer) observer.disconnect();
    };
    const finalClean = () => {
      clean();
      if (stopWatch) stopWatch();
    };
    if (supported) {
      if (!observerInit) observer = new window[name](callback as any, runIfFn(observerInit)) as O;
      stopWatch = watchPostEffect(() => {
        clean();
        if (observerInit) observer = new window[name](callback as any, runIfFn(observerInit)) as O;
        if (unrefOrGet(disabled)) return;
        ensureArray(unrefOrGet(targets)).forEach((e) => {
          // @ts-expect-error
          if (isElement(e)) observer.observe(e, runIfFn(observeOptions, e));
        });
      });
      tryOnScopeDispose(finalClean);
    }

    return {
      clean: finalClean,
      supported,
      observer,
    };
  };
}

export const useResizeObserver = createUseObserver('Resize');
export const useIntersectionObserver = createUseObserver('Intersection');
export const useMutationObserver = createUseObserver('Mutation');
