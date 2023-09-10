import { getCurrentInstance, onMounted, shallowReactive } from '@vue/runtime-core';

export function getCurrentShadowInfo<RootEl extends HTMLElement, ParentEl extends HTMLElement>() {
	const instance = getCurrentInstance();
	const state = shallowReactive({
		rootEl: undefined as RootEl | undefined,
		CE: undefined as ParentEl | undefined,
	});
	/** el of vnode is not null only after onMounted */
	onMounted(() => {
		state.rootEl = instance?.vnode.el as RootEl;
		state.CE = (state.rootEl?.parentNode as ShadowRoot)?.host as ParentEl;
	});
	return state;
}

/**
 * expose something to Custom Element
 */
export function exposeToCE(expose: Record<string | symbol, any>) {
	const instance = getCurrentInstance();
	onMounted(() => {
		const rootEl = instance?.vnode.el as HTMLElement;
		const CE = (rootEl?.parentNode as ShadowRoot)?.host;
		if (CE) {
			Object.assign(CE, expose);
		}
	});
}
