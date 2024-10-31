import { getCurrentInstance } from 'vue';

export * from './shadowDom';
export * from './transition';
export * from './useBreakpoint';
export * from './useCollectorValue';
export * from './useNameSpace';
export * from './useOptions';
export * from './useSlot';
export * from './useStyles';
export * from './useTooltip';
export * from './useValue';

// vue setup expose can only be used once. But we have manual expose in useNameSpace, need to expose multiple times.
export function useExpose(obj: Record<string, any>, properties?: PropertyDescriptorMap) {
  const vm = getCurrentInstance()!;
  if (!vm.exposed) vm.exposed = obj;
  else Object.defineProperties(vm.exposed, Object.getOwnPropertyDescriptors(obj));
  if (properties) Object.defineProperties(vm.exposed, properties);
}
