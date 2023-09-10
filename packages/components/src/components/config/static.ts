export const components = Object.freeze(['button', 'input'] as const);
export type ComponentKey = (typeof components)[number];

const extraStyles = (() => {
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
export const GlobalStaticConfig = new Proxy({
	components: {
		prefix: 'l',
		get nameMap() {
			return components.reduce((result, name) => {
				result[name] = `${this.prefix}-${name}`;
				return result;
			}, {} as Record<ComponentKey, string>);
		},
		defaultProps: {},
		/** define every components' styles, also can set global common style with `common` key */
		extraStyles,
	},
}, {
  get(target, p, receiver) {
    // deep get, or remove components key
    return Reflect.get(target, p, receiver);
  },
});

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
