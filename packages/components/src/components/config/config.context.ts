import { inject, provide, reactive } from "vue";
import { iconRegistryMap } from "../icon/icon.registry";

const contextConfigKey = Symbol.for('l-context-config-key');

export const GlobalContextConfig = reactive({
  iconRegistryMap,
});

export type TGlobalContextConfig = typeof GlobalContextConfig;
export type kTGlobalContextConfig = keyof TGlobalContextConfig;

export function provideContextConfig(config: TGlobalContextConfig) {
  provide(contextConfigKey, config);
}

export function useContextConfig(): TGlobalContextConfig;
export function useContextConfig<K extends kTGlobalContextConfig>(key: K): TGlobalContextConfig[K];
/**
 * return a specific part of current effect config, if no key provided, return the whole config object
 */
export function useContextConfig(key?: kTGlobalContextConfig) {
  const result = inject(contextConfigKey, GlobalContextConfig);
  return key ? result[key] : result;
}
