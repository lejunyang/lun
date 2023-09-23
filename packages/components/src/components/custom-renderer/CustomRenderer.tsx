import { defineCustomElement } from 'custom';
import { GlobalStaticConfig } from 'config';
import { onMounted, shallowRef, onBeforeUnmount, watchEffect, isVNode } from 'vue';
import { CustomRendererRegistry } from './renderer.registry';

const CustomRenderer = defineCustomElement({
	name: GlobalStaticConfig.nameMap['custom-renderer'],
	noShadow: true,
	props: {
		name: { type: String },
		source: { required: true },
	},
	setup(props, { attrs }) {
		const div = shallowRef<HTMLDivElement>();
		const defaultSupportContent = shallowRef();
		let mounted = false;
		let renderer: CustomRendererRegistry | undefined;
		let lastWasHtml = false;
		watchEffect(() => {
			let { name, source } = props;
			renderer = undefined; // clear before and get new renderer
			if (name) {
				const temp = GlobalStaticConfig.customRendererMap[name];
				if (temp?.isValidSource(source)) renderer = temp;
			}
			if (!renderer) {
				for (const registry of Object.values(GlobalStaticConfig.customRendererMap)) {
					if (registry.isValidSource(source)) {
						renderer = registry;
						break;
					}
				}
			}
			// no valid renderer, check the source if it is string, number or vnode, render it if yes
			if (!renderer) {
				if (source instanceof Function) source = source(); // if it's a function, consider it as a getter
				if (['string', 'number'].includes(typeof source) && div.value) {
					div.value.innerHTML = GlobalStaticConfig.vHtmlPreprocessor(String(source));
					lastWasHtml = true;
				} else if (isVNode(source)) defaultSupportContent.value = source;
			} else {
				defaultSupportContent.value = null;
				if (lastWasHtml && div.value) {
					div.value.innerHTML = '';
					lastWasHtml = false;
				}
			}
			if (mounted && renderer?.onUpdated) {
				renderer.onUpdated(source, div.value!, attrs);
			}
		});

		onMounted(() => {
			mounted = true;
			console.log('div', div);
			if (renderer) {
				renderer.onMounted(props.source, div.value!, attrs);
			}
		});
		onBeforeUnmount(() => {
			mounted = false;
			if (renderer?.onBeforeUnmount) {
				renderer.onBeforeUnmount(props.source, div.value!);
			}
		});
		return () => (
			<div ref={div} style="display: contents">
				{defaultSupportContent.value}
			</div>
		);
	},
});

export default CustomRenderer;

declare module 'vue' {
	export interface GlobalComponents {
		LCustomRenderer: typeof CustomRenderer;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'l-custom-renderer': typeof CustomRenderer;
	}
}

export function defineCustomRenderer(name?: string) {
	name ||= GlobalStaticConfig.nameMap['custom-renderer'];
	if (!customElements.get(name)) {
		customElements.define(name, CustomRenderer);
	}
}
