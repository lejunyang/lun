import { ComponentInternalInstance, inject, provide, reactive } from 'vue';
import { iconRegistryMap } from '../icon/icon.registry';
import { ShadowComponentKey, shadowComponents } from './config.static';
import { ThemeProps } from 'common';
import { deepMerge } from '@lun/utils';

export const CONTEXT_CONFIG_KEY = Symbol(__DEV__ ? 'l-context-config-key' : '');

export const GlobalContextConfig = reactive({
  namespace: 'l',
  iconRegistryMap,
  dynamicStyles: (() => {
    const original = shadowComponents.reduce((result, name) => {
      result[name] = [];
      return result;
    }, {} as Record<'common' | ShadowComponentKey, ((vm: ComponentInternalInstance) => string)[]>);
    const commonStyles = [] as ((vm: ComponentInternalInstance) => string)[];
    return new Proxy(original, {
      get(target, p, receiver) {
        if (p === 'common') return commonStyles;
        return [...commonStyles, ...Reflect.get(target, p, receiver)].filter(Boolean);
      },
    });
  })(),
  theme: {
    variant: 'surface',
  } as ThemeProps,
});

export type TGlobalContextConfig = typeof GlobalContextConfig;
export type kTGlobalContextConfig = keyof TGlobalContextConfig;

export function provideContextConfig(config: Partial<TGlobalContextConfig>) {
  const parentConfig = useContextConfig();
  provide(CONTEXT_CONFIG_KEY, deepMerge(parentConfig || {}, config));
}

export function useContextConfig(): TGlobalContextConfig;
export function useContextConfig<K extends kTGlobalContextConfig>(key: K): TGlobalContextConfig[K];
/**
 * return a specific part of current effect config, if no key provided, return the whole config object
 */
export function useContextConfig(key?: kTGlobalContextConfig) {
  const result = inject(CONTEXT_CONFIG_KEY, GlobalContextConfig);
  return key ? result[key] : result;
}
