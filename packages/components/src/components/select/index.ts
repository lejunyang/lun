import { ComponentInternalInstance, getCurrentInstance, inject, provide } from 'vue';

export * from './Select';
export * from './SelectOptgroup';
export * from './SelectOption';

export * from './type';
export * from './collector';


export const SelectOptgroupContext = (() => {
  const key = Symbol(__DEV__ ? 'select-optgroup' : '');
  return {
    provide: () => {
      const vm = getCurrentInstance();
      vm && provide(key, vm);
    },
    inject: () => inject<ComponentInternalInstance>(key),
  };
})();
