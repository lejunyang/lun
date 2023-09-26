import { defineCustomElement } from 'custom';
import { PropType, VNode, isVNode, onUnmounted, shallowReactive, watchEffect } from 'vue';
import { GlobalStaticConfig, useContextConfig } from 'config';
import { error } from 'utils';
import type { IconLibraryValue, IconNameValue } from './icon.default';

export const iconResolveCache = new Map<string, { type: string; src: string }>();

export const Icon = defineCustomElement({
	name: GlobalStaticConfig.nameMap.icon,
	props: {
		library: { type: String as PropType<IconLibraryValue>, default: () => GlobalStaticConfig.defaultProps.icon.library },
		name: { type: String as PropType<IconNameValue>, required: true },
		clearCacheWhenUnmounted: { type: Boolean },
	},
	setup(props) {
		const config = useContextConfig();
		const state = shallowReactive({
			type: '',
			src: '' as string | VNode,
		});
		watchEffect(async () => {
			const { library, name } = props;
			const libraryOption = config.iconRegistryMap[props.library];
			if (!library || !name || !libraryOption) return;
			const cache = iconResolveCache.get(`${library}.${name}`);
			if (cache) {
				state.type = cache.type;
				state.src = cache.src;
				return;
			}
			let { type, mutator, resolver } = libraryOption;
			mutator = mutator instanceof Function ? mutator : (i) => i;
			try {
				let result = await resolver(name);
				if (type === 'html-url' && typeof result === 'string') {
					// if type is `html-url`, do a fetch to get html text
					result = (await GlobalStaticConfig.iconRequest(result))!;
					if (!result) return;
					type = 'html';
				}
				if (props.library !== library || props.name !== name) {
					// if props update after await, ignore this effect
					return;
				}
				result = mutator(result) || result;
				// clear previous
				state.type = '';
				state.src = '';
				switch (type) {
					case 'html':
						if (typeof result === 'string') state.src = result;
						state.type = type;
						break;
					case 'svg-sprite-href':
						if (typeof result === 'string') state.src = result;
						state.type = type;
						break;
					case 'vnode':
						if (isVNode(result)) state.src = result;
						state.type = 'vnode';
						break;
				}
				if (state.src && typeof state.src === 'string') {
					// vnode cannot be reused, only cache string
					iconResolveCache.set(`${library}.${name}`, { type: state.type, src: state.src });
				}
			} catch (e) {
				if (__DEV__) error('An error occurred when updating icon', e);
			}
		});

		onUnmounted(() => {
			if (props.clearCacheWhenUnmounted && props.library && props.name) {
				iconResolveCache.delete(`${props.library}.${props.name}`);
			}
		});
		return () => {
			if (!state.src) return null;
			switch (state.type) {
				case 'vnode':
					return state.src;
				case 'html':
					return (
						<span
							style={{ display: 'contents' }}
							v-html={GlobalStaticConfig.vHtmlPreprocessor(state.src as string)}></span>
					);
				case 'svg-sprite-href':
					return (
						<svg part="svg">
							<use part="use" href={state.src as string}></use>
						</svg>
					);
			}
		};
	},
});

declare module 'vue' {
	export interface GlobalComponents {
		LIcon: typeof Icon;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'l-icon': typeof Icon;
	}
}

export function defineIcon(name?: string) {
	name ||= GlobalStaticConfig.nameMap.icon;
	if (!customElements.get(name)) {
		GlobalStaticConfig.actualNameMap['icon'].add(name);
		customElements.define(name, Icon);
	}
}
