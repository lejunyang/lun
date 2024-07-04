import { ComponentInternalInstance, inject, provide, reactive } from 'vue';
import { iconRegistryMap } from '../icon/icon.registry';
import { OpenShadowComponentKey, openShadowComponents } from './config.static';
import { ThemeConfig } from 'common';
import { inherit, isObject } from '@lun/utils';

const CONTEXT_CONFIG_KEY = Symbol(__DEV__ ? 'l-context-config-key' : '');

export const GlobalContextConfig = reactive({
  namespace: 'l',
  lang: 'zh-CN',
  iconRegistryMap,
  dynamicStyles: (() => {
    const original = openShadowComponents.reduce((result, name) => {
      result[name] = [];
      return result;
    }, {} as Record<'common' | OpenShadowComponentKey, ((vm: ComponentInternalInstance, compName: OpenShadowComponentKey, context: any) => string)[]>);
    const commonStyles = [] as ((
      vm: ComponentInternalInstance,
      compName: OpenShadowComponentKey,
      context: any,
    ) => string)[];
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
    scale: 1,
  } as ThemeConfig,
  zIndex: {
    teleport: 1000,
    dialog: 1000,
    popover: 1000,
    tooltip: 1010,
    message: 1020,
  },
});

export type TGlobalContextConfig = typeof GlobalContextConfig;
export type kTGlobalContextConfig = keyof TGlobalContextConfig;

export function provideContextConfig(config: Partial<TGlobalContextConfig>) {
  const parentConfig = useContextConfig();
  for (const [key, value] of Object.entries(config)) {
    if (isObject(value)) inherit(value, parentConfig[key as keyof typeof parentConfig]);
  }
  // TODO test which one is fast, prototype or virtualMerge
  inherit(config, parentConfig); // config is partial, so we also need to set parent as its prototype
  provide(CONTEXT_CONFIG_KEY, config);
}

export function useContextConfig(): TGlobalContextConfig;
export function useContextConfig<K extends kTGlobalContextConfig>(key: K): TGlobalContextConfig[K];
/**
 * return the specific effective config if key provided, or return the whole config object
 */
export function useContextConfig(key?: kTGlobalContextConfig) {
  const result = inject(CONTEXT_CONFIG_KEY, GlobalContextConfig);
  return key ? result[key] : result;
}
