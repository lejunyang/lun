import { inject, provide, reactive } from "vue";
import { iconRegistryMap } from "../icon/icon.registry";

const contextConfigKey = Symbol.for('l-context-config-key');

export const GlobalConfig = reactive({
  iconRegistryMap,
  /** function used to process html string before pass it to v-html, you can use this to do XSS filter */
  vHtmlPreprocessor: (html: string) => html,
});

export type TGlobalConfig = typeof GlobalConfig;
export type kTGlobalConfig = keyof TGlobalConfig;

export function provideConfig(config: TGlobalConfig) {
  provide(contextConfigKey, config);
}

export function useConfig(): TGlobalConfig;
export function useConfig<K extends kTGlobalConfig>(key: K): TGlobalConfig[K];
/**
 * return a specific part of current effect config, if no key provided, return the whole config object
 */
export function useConfig(key?: kTGlobalConfig) {
  const result = inject(contextConfigKey, GlobalConfig);
  return key ? result[key] : result;
}
