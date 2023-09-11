import { inject, provide } from "vue";
import { iconRegistryMap } from "../icon/icon.registry";

const contextConfigKey = Symbol.for('l-context-config-key');

export const GlobalConfig = {
  iconRegistryMap
}

export type TGlobalConfig = typeof GlobalConfig;

export function provideConfig(config: TGlobalConfig) {
  provide(contextConfigKey, config);
}

export function useConfig(): TGlobalConfig;
export function useConfig<K extends keyof TGlobalConfig>(key: K): TGlobalConfig[K];
export function useConfig(key?: keyof TGlobalConfig) {
  const result = inject(contextConfigKey, GlobalConfig);
  return key ? result[key] : result;
}

