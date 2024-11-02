import { getCurrentInstance } from "vue";

// vue setup expose can only be used once. But we have manual expose in useNameSpace, need to expose multiple times.
export function useExpose(obj: Record<string, any>, properties?: PropertyDescriptorMap) {
  const vm = getCurrentInstance()!;
  if (!vm.exposed) vm.exposed = obj;
  else Object.defineProperties(vm.exposed, Object.getOwnPropertyDescriptors(obj));
  if (properties) Object.defineProperties(vm.exposed, properties);
}
