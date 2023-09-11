import { VNode, reactive } from 'vue';
import { GlobalStaticConfig } from '../config/static';
import { pick } from '@lun/utils';

export type IconLibraryResolver = (name: string) => string | VNode | Promise<string> | Promise<VNode>;
export type IconLibraryMutator = <T extends string | VNode>(iconResult: T) => T;
export interface IconLibrary {
	name: string;
  type: 'html' | 'htmlUrl' | 'svgUseUrl' | 'vue';
	resolver: IconLibraryResolver;
	mutator?: IconLibraryMutator;
}

export const iconRegistryMap: Record<string, IconLibrary> = reactive({});

export function registerIconLibrary(options: IconLibrary) {
	if (!options?.name || !(options.resolver instanceof Function) || !options.type) return;
	iconRegistryMap[options.name] = pick(options, ['name', 'type', 'resolver', 'mutator']);
}
