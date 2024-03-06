import { ComponentInternalInstance, inject, provide, reactive } from 'vue';
import { iconRegistryMap } from '../icon/icon.registry';
import { OpenShadowComponentKey, openShadowComponents } from './config.static';
import { ThemeConfig } from 'common';
import { virtualGetMerge } from '@lun/utils';

export const CONTEXT_CONFIG_KEY = Symbol(__DEV__ ? 'l-context-config-key' : '');

export const GlobalContextConfig = reactive({
  namespace: 'l',
  lang: 'zh-CN',
  iconRegistryMap,
  dynamicStyles: (() => {
    const original = openShadowComponents.reduce((result, name) => {
      result[name] = [];
      return result;
    }, {} as Record<'common' | OpenShadowComponentKey, ((vm: ComponentInternalInstance) => string)[]>);
    const commonStyles = [] as ((vm: ComponentInternalInstance) => string)[];
    return new Proxy(original, {
      get(target, p, receiver) {
        if (p === 'common') return commonStyles;
        if (!(p in original)) {
          // vue will access this, _v_raw _v_skip...
          return Reflect.get(target, p, receiver);
        }
        return [...commonStyles, ...Reflect.get(target, p, receiver)].filter(Boolean);
      },
    });
  })(),
  theme: {
    variant: 'surface',
    size: {
      initial: '1',
      sm: '2',
      xl: '3',
    },
  } as ThemeConfig,
  zIndex: {
    teleport: 1000,
    popover: 1000,
    tooltip: 1010,
    message: 1020,
  },
});

export type TGlobalContextConfig = typeof GlobalContextConfig;
export type kTGlobalContextConfig = keyof TGlobalContextConfig;

export function provideContextConfig(config: Partial<TGlobalContextConfig>) {
  const parentConfig = useContextConfig();
  provide(CONTEXT_CONFIG_KEY, {
    ...parentConfig,
    ...config,
    // theme-provider provides props as theme, actual merge will make it lose reactivity, so need a virtual merge
    theme: config.theme ? virtualGetMerge(config.theme, parentConfig.theme) : parentConfig.theme,
  });
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
