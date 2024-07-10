import { Fn } from '@lun/utils';
import { getCurrentInstance, getCurrentScope, onMounted, onScopeDispose, shallowRef } from 'vue';

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
