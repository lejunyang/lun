import { getCurrentInstance, getCurrentScope, onMounted, onScopeDispose, shallowRef } from 'vue';

// from vue/use

export function useMounted() {
  const result = shallowRef(false);
  getCurrentInstance() && onMounted(() => (result.value = true));
}

export function tryOnScopeDispose(fn: Fn) {
  if (getCurrentScope()) {
    onScopeDispose(fn);
    return true;
  }
  return false;
}
