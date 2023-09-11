import { defineCustomElement } from 'custom';
import { VNode, isVNode, shallowReactive, watchEffect } from 'vue';
import { useConfig } from '../config';

const LIcon = defineCustomElement({
	props: {
		library: { type: String, default: 'default' },
		name: { type: String, required: true },
	},
	setup(props) {
		const iconRegistryMap = useConfig('iconRegistryMap');
		const state = shallowReactive({
			type: '',
			src: '' as string | VNode,
		});
		watchEffect(async () => {
			const library = iconRegistryMap[props.library];
			if (!library) return;
			let { name, type, mutator, resolver } = library;
			mutator = mutator instanceof Function ? mutator : (i) => i;
			try {
				let result = await resolver(name);
				result = mutator(result) || result;
				switch (type) {
					case 'html':
						if (typeof result === 'string') state.src = result;
						state.type = type;
						break;
					case 'htmlUrl':
						//
						state.type = 'html';
						break;
					case 'svgUseUrl':
						if (typeof result === 'string') state.src = result;
						state.type = type;
						break;
					case 'vue':
						if (isVNode(result)) state.src = result;
						state.type = 'vue';
						break;
				}
			} catch (e) {}
		});
		return () => {
			if (!state.src) return null;
			switch (state.type) {
				case 'vue':
					return state.src;
				case 'html':
					return <span style={{ display: 'contents' }} v-html={state.src}></span>;
				case 'svgUseUrl':
					return (
						<svg part="svg">
							<use part="use" url={state.src}></use>
						</svg>
					);
			}
		};
	},
});
