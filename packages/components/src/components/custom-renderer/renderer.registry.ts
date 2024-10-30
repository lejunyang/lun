import { error, warn } from 'utils';
import { GlobalStaticConfig } from 'config';
import { isFunction } from '@lun-web/utils';

export type CustomRendererRegistry = {
  isValidContent: (content: any) => boolean;
  onMounted: (content: any, target: HTMLElement, otherProps: Record<string | symbol, unknown>) => void;
  onUpdated?: (content: any, target: HTMLElement, otherProps: Record<string | symbol, unknown>) => void;
  onBeforeUnmount?: (content: any, target: HTMLElement) => void;
  clone?: (content?: any) => any;
};

export function getInitialCustomRendererMap() {
  const map = {} as Record<string | symbol, CustomRendererRegistry>;
  return new Proxy(map, {
    set(target, p, newValue, receiver) {
      if (__DEV__ && target[p]) {
        warn(`Custom renderer '${String(p)}' has already been set, it will be overwritten`);
      }
      if (!newValue || Object.values(newValue).some((f) => !isFunction(f))) {
        if (__DEV__) {
          error(`Invalid custom renderer was set, please check the value:`, newValue);
        }
        return false;
      }
      return Reflect.set(target, p, newValue, receiver);
    },
  });
}

export function registerCustomRenderer(type: string, registry: CustomRendererRegistry) {
  if (type) {
    GlobalStaticConfig.customRendererRegistry[type] = registry;
  }
}
