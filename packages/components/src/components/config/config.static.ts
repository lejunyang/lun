import { supportCSSStyleSheet } from '@lun/utils';
import { error } from '../../utils';
import {
  getInitialDefaultAnimationRegistry,
  getInitialElementAnimationRegistry,
} from '../animation/animation.registry';
import { getInitialCustomRendererMap } from '../custom-renderer/renderer.registry';

export const components = Object.freeze(['button', 'base-input', 'custom-renderer', 'input', 'icon', 'spin'] as const);
export type ComponentKey = (typeof components)[number];

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
    actualNameMap: components.reduce((result, name) => {
      result[name] = new Set();
      return result;
    }, {} as Record<ComponentKey, Set<string>>),
    defaultProps: {
      icon: {
        library: 'default',
      },
      'base-input': {
        changeWhen: 'notComposing',
        waitType: 'debounce',
        trim: true,
        restrictWhen: 'notComposing',
        toNullWhenEmpty: true,
        transformWhen: 'notComposing',
        emitEnterDownWhenComposing: false,
      } as const,
      input: {
        changeWhen: 'notComposing',
        waitType: 'debounce',
        trim: true,
        restrictWhen: 'notComposing',
        toNullWhenEmpty: true,
        transformWhen: 'notComposing',
        emitEnterDownWhenComposing: false,
			} as const,
			spin: {
        type: 'circle',
        strokeWidth: 4,
        size: '1',
			} as const
    },
    preferCSSStyleSheet: supportCSSStyleSheet(),
    /** define every components' styles, also can set global common style with `common` key */
    styles: (() => {
      const original = components.reduce((result, name) => {
        result[name] = [];
        return result;
      }, {} as Record<'common' | ComponentKey, (string | CSSStyleSheet)[]>);
      const commonStyles = [] as (string | CSSStyleSheet)[];
      return new Proxy(original, {
        get(target, p, receiver) {
          if (p === 'common') return commonStyles;
          return [...commonStyles, ...Reflect.get(target, p, receiver)].filter(Boolean);
        },
      });
    })(),
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
    customRendererMap: getInitialCustomRendererMap(),
    animationRegistry: getInitialDefaultAnimationRegistry(),
    elAnimationRegistry: getInitialElementAnimationRegistry(),
  },
  {
    get(target, p, receiver) {
      // deep get, or remove components key
      return Reflect.get(target, p, receiver);
    },
    set(target: any, p, newValue, receiver) {
      const oldVal = target[p];
      if (Object.getPrototypeOf(oldVal) !== Object.getPrototypeOf(newValue)) {
        if (__DEV__)
          error(`Invalid static config was set on ${String(p)}`, 'old config:', target[p], 'new config:', newValue);
        return false;
      } else return Reflect.set(target, p, newValue, receiver);
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
