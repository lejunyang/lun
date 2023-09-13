export const components = Object.freeze(['button', 'input', 'icon'] as const);
export type ComponentKey = (typeof components)[number];

const styles = (() => {
	const original = {
		input: [],
	} as unknown as Record<'common' | ComponentKey, (string | CSSStyleSheet)[]>;
	const commonStyles = [] as (string | CSSStyleSheet)[];
	return new Proxy(original, {
		get(target, p, receiver) {
			if (p === 'common') return commonStyles;
			return [...commonStyles, Reflect.get(target, p, receiver)].filter(Boolean);
		},
	});
})();

let inited = false;
let isInInitFunc = false;

/**
 * use `initStaticConfig` to set up your personal config\
 * Please make sure you do it before you import the component or read the config\
 * otherwise you can't modify it anymore
 */
export const GlobalStaticConfig = new Proxy(
	{
		prefix: 'l',
		get nameMap() {
			return components.reduce((result, name) => {
				result[name] = `${this.prefix}-${name}`;
				return result;
			}, {} as Record<ComponentKey, string>);
		},
		defaultProps: {
			icon: {
				library: 'default',
			},
		},
		/** define every components' styles, also can set global common style with `common` key */
		styles,
		/** function used to request icon url, should return html string */
		iconRequest: async (url?: string | null) => {
			if (!url) return;
			if (typeof fetch === 'function') {
				const response = await fetch(url, { mode: 'cors' });
				const result = await response.text();
				if (response.ok) return result;
			}
		},
		/** function used to process html string before pass it to v-html, you can use this to do XSS filter */
		vHtmlPreprocessor: (html: string) => html,
	},
	{
		get(target, p, receiver) {
			// deep get, or remove components key
			return Reflect.get(target, p, receiver);
		},
		set(target, p, newValue, receiver) {
			const oldVal = (target as any)[p];
			if (oldVal instanceof Function && !(newValue instanceof Function)) return false;
			else return Reflect.set(target, p, newValue, receiver);
		},
	}
);

// TODO use Proxy to intercept GlobalStaticConfig, if some properties were read, freeze the whole object, make inited true

/**
 * GlobalStaticConfig can be initialized with `initStaticConfig` only once.\
 * Repeat call will not take effect
 */
export function initStaticConfig() {
	if (inited) {
		return GlobalStaticConfig;
	}
	// need deep freeze
	Object.freeze(GlobalStaticConfig);
}
