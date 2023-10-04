/*! #__NO_SIDE_EFFECTS__ */

import { RootHydrateFunction, defineComponent, hydrate } from 'vue';
import { VueElement, VueElementConstructor, defineCustomElement } from './apiCustomElement';

export const defineCustomFormElement: typeof defineCustomElement = function (
	options: any,
	hydrate?: RootHydrateFunction
): VueElementConstructor {
	const Comp = defineComponent(options) as any;
	class VueCustomElement extends VueElement {
		static formAssociated: true;
		static def = Comp;
		_internals?: ElementInternals;
		constructor(initialProps?: Record<string, any>) {
			super(Comp, initialProps, hydrate);
			try {
				this._internals = this.attachInternals();
			} catch (e) {
				if (__DEV__) {
					console.error(`An Error occurs when '${Comp.name || 'custom element'}' attachInternals()`, e);
				}
			}
		}
	}
	return VueCustomElement;
};

export const defineSSRCustomFormElement: typeof defineCustomFormElement = function (options: any) {
	// @ts-ignore
	return defineCustomFormElement(options, hydrate) as any;
}