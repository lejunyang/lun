import { defineCustomElement } from 'custom';
import { GlobalStaticConfig } from 'config';
import { onMounted, shallowRef, onBeforeUnmount, watchEffect, isVNode } from 'vue';
import { CustomRendererRegistry } from './renderer.registry';

const CustomRenderer = defineCustomElement({
	name: GlobalStaticConfig.nameMap['custom-renderer'],
	noShadow: true,
	inheritAttrs: false,
	props: {
		type: { type: String },
		content: { required: true },
	},
	onCE(_instance, ce) {
		ce.style.display = 'contents';
	},
	setup(props, { attrs }) {
		const div = shallowRef<HTMLDivElement>();
		const defaultSupportContent = shallowRef();
		let mounted = false;
		let renderer: CustomRendererRegistry | undefined;
		let lastWasHtml = false;
		watchEffect(() => {
			let { type, content } = props;
			renderer = undefined; // clear before and get new renderer
			if (type) {
				const temp = GlobalStaticConfig.customRendererMap[type];
				if (temp?.isValidContent(content)) renderer = temp;
			}
			if (!renderer) {
				for (const registry of Object.values(GlobalStaticConfig.customRendererMap)) {
					if (registry.isValidContent(content)) {
						renderer = registry;
						break;
					}
				}
			}
			// no valid renderer, check the content if it is string, number or vnode, render it if yes
			if (!renderer) {
				if (content instanceof Function) content = content(); // if it's a function, consider it as a getter
				if (['string', 'number'].includes(typeof content) && div.value) {
					div.value.innerHTML = GlobalStaticConfig.vHtmlPreprocessor(String(content));
					lastWasHtml = true;
				} else if (isVNode(content)) defaultSupportContent.value = content;
				else if (content instanceof Node && div.value) {
					div.value.innerHTML = '';
					if (content instanceof HTMLTemplateElement) content = document.importNode(content.content, true);
					div.value.append(content as Node);
					lastWasHtml = true;
				}
			} else {
				defaultSupportContent.value = null;
				if (lastWasHtml && div.value) {
					div.value.innerHTML = '';
					lastWasHtml = false;
				}
			}
			// TODO if it's vnode previous and html next, will it unmount correctly?
			if (mounted && renderer?.onUpdated) {
				renderer.onUpdated(content, div.value!, attrs);
			}
		});

		onMounted(() => {
			mounted = true;
			if (renderer) {
				renderer.onMounted(props.content, div.value!, attrs);
			}
		});
		onBeforeUnmount(() => {
			mounted = false;
			if (renderer?.onBeforeUnmount) {
				renderer.onBeforeUnmount(props.content, div.value!);
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
