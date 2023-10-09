import { getCurrentInstance, onMounted, shallowRef } from "vue";

export function useMounted() {
  const result = shallowRef(false);
  getCurrentInstance() && onMounted(() => result.value = true);
}