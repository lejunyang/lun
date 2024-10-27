import { AnyFn, Fn, noop } from '@lun-web/utils';
import { getCurrentInstance, getCurrentScope, onMounted, onScopeDispose, shallowRef, watch, watchEffect } from 'vue';

// from vue/use

export function useMounted() {
  const result = shallowRef(false);
  getCurrentInstance() && onMounted(() => (result.value = true));
  return result;
}

export function tryOnScopeDispose(fn: Fn) {
  if (getCurrentScope()) {
    onScopeDispose(fn);
    return true;
  }
  return false;
}

const createWatchOnMounted =
  <W extends AnyFn>(watch: W): ((...params: Parameters<W>) => void) =>
  (...args) => {
    const scope = getCurrentScope()!;
    let stop = noop;
    getCurrentInstance() &&
      onMounted(() => {
        scope.run(() => (stop = watch(...args)));
      });
    return () => stop();
  };

export const watchEffectOnMounted = createWatchOnMounted(watchEffect) as typeof watchEffect;

export const watchOnMounted = createWatchOnMounted(watch) as typeof watch;

export const useCleanUp = () => {
  let cleanups: ((() => void) | false | null | undefined)[] = [];
  const addCleanup = (...fns: ((() => void) | false | null | undefined)[]) => {
    cleanups.push(...fns);
  };
  const cleanUp = () => {
    cleanups.forEach((fn) => fn && fn());
    cleanups = [];
  };
  tryOnScopeDispose(cleanUp);
  return [addCleanup, cleanUp] as const;
};
