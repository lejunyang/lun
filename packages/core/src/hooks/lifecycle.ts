import { Fn } from '@lun-web/utils';
import { getCurrentInstance, getCurrentScope, onMounted, onScopeDispose, shallowRef } from 'vue';

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
