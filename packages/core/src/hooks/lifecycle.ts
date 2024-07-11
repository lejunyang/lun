import { Fn, noop } from '@lun/utils';
import { getCurrentInstance, getCurrentScope, onMounted, onScopeDispose, shallowRef, watchEffect } from 'vue';

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

export const watchEffectOnMounted: typeof watchEffect = (fn, options) => {
  const scope = getCurrentScope();
  let stop = noop;
  scope &&
    onMounted(() => {
      scope.run(() => (stop = watchEffect(fn, options)));
    });
  return () => stop();
};
