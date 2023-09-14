import { inject, provide, reactive } from 'vue';
import { iconRegistryMap } from '../icon/icon.registry';

export const CONTEXT_CONFIG_KEY = Symbol(__DEV__ ? 'l-context-config-key' : '');

export const GlobalContextConfig = reactive({
	iconRegistryMap,
});

export type TGlobalContextConfig = typeof GlobalContextConfig;
export type kTGlobalContextConfig = keyof TGlobalContextConfig;

export function provideContextConfig(config: TGlobalContextConfig) {
	provide(CONTEXT_CONFIG_KEY, config);
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
