import { isSupportCSSStyleSheet, isNumber, numbersEqual, greaterThan, lessThan } from '@lun/utils';
import { error } from '../../utils';
import {
  getInitialDefaultAnimationRegistry,
  getInitialElementAnimationRegistry,
} from '../animation/animation.registry';
import { getInitialCustomRendererMap } from '../custom-renderer/renderer.registry';
import { ref } from 'vue';
import { createMath } from '../../common/math';

export const noShadowComponents = Object.freeze(['custom-renderer', 'theme-provider'] as const);
export const shadowComponents = Object.freeze([
  'button',
  'checkbox',
  'checkbox-group',
  'dialog',
  'form',
  'form-item',
  'icon',
  'base-input',
  'input',
  'popover',
  'radio',
  'radio-group',
  'select',
  'select-option',
  'select-optgroup',
  'spin',
  'switch',
  'tooltip',
  'upload',
] as const);
export const components = Object.freeze([...shadowComponents, ...noShadowComponents] as const);
export type ComponentKey = (typeof components)[number];
export type ShadowComponentKey = (typeof shadowComponents)[number];

export type ComponentStyles = Record<'common' | ShadowComponentKey, (string | CSSStyleSheet)[]>;

let inited = false;
let isInInitFunc = false;

const styles = shadowComponents.reduce(
  (result, name) => {
    result[name] = [];
    return result;
  },
  { common: [] } as unknown as ComponentStyles
);

const langRef = ref('zh-CN');

/**
 * use `initStaticConfig` to set up your personal config\
 * Please make sure you do it before you import the component or read the config\
 * otherwise you can't modify it anymore
 */
export const GlobalStaticConfig = new Proxy(
  {
    lang: langRef.value,
    namespace: 'l',
    commonSeparator: '-',
    elementSeparator: '__',
    modifierSeparator: '--',
    statePrefix: 'is-',
    nameMap: (() => {
      const result = {} as { readonly [k in ComponentKey]: string };
      components.forEach((name) => {
        Object.defineProperty(result, name, {
          get: () => {
            return `${GlobalStaticConfig.namespace}-${name}`;
          },
          configurable: false,
        });
      });
      return result;
    })(),
    actualNameMap: components.reduce((result, name) => {
      result[name] = new Set();
      return result;
    }, {} as Record<ComponentKey, Set<string>>),
    defaultProps: {
      button: {
        size: '1' as const,
        showLoading: true,
        iconPosition: 'start' as const,
        variant: 'surface',
      },
      checkbox: {
        labelPosition: 'end' as const,
      },
      'checkbox-group': {
      },
      'custom-renderer': {},
      dialog: {
        closeBtn: true,
        escapeClosable: true,
        modal: 'native',
      },
      form: {
        plainName: undefined,
      },
      'form-item': {
        plainName: undefined,
      },
      icon: {
        library: 'default' as const,
      },
      'base-input': {
        waitType: 'debounce' as const,
        trim: true,
      },
      input: {
        waitType: 'debounce' as const,
        trim: true,
        updateWhen: (props: any) => {
          // console.log('props', props);
          return props.multiple ? 'change' : 'not-composing';
        },
        showClearIcon: true,
      },
      popover: {},
      radio: {
        labelPosition: 'end' as const,
      },
      'radio-group': {
      },
      select: {},
      'select-option': {},
      'select-optgroup': {},
      spin: {
        type: 'circle' as const,
        strokeWidth: 4,
        size: '1' as const,
      },
      switch: {
        trueValue: true,
        falseValue: false,
      },
      'theme-provider': {},
      tooltip: {},
      upload: {},
    },
    preferCSSStyleSheet: isSupportCSSStyleSheet(),
    /** define every components' static styles, also can set global common style with `common` key */
    styles,
    computedStyles: new Proxy(styles, {
      get(target, p, receiver) {
        if (p === 'common') return [...Reflect.get(target, 'common', receiver)];
        return Reflect.get(target, 'common', receiver).concat(Reflect.get(target, p, receiver)).filter(Boolean);
      },
    }),
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
    math: createMath<number | Number>({
      isNumber,
      isNaN: Number.isNaN,
      isZero: (target) => target === 0,
      toNumber: (target) => Number(target),
      // @ts-ignore
      plus: (target, delta) => target + delta,
      // @ts-ignore
      minus: (target, delta) => target - delta,
      max: Math.max,
      min: Math.min,
      equals: numbersEqual,
      greaterThan,
      lessThan,
    }),
  },
  {
    get(target, p, receiver) {
      if (p === 'lang') return langRef.value;
      // deep get, or remove components key
      return Reflect.get(target, p, receiver);
    },
    set(target: any, p, newValue, receiver) {
      const oldVal = target[p];
      if (__DEV__ && Object.getPrototypeOf(oldVal) !== Object.getPrototypeOf(newValue)) {
        error(`Invalid static config was set on ${String(p)}`, 'old config:', target[p], 'new config:', newValue);
        return false;
      } else {
        if (p === 'lang') langRef.value = newValue;
        return Reflect.set(target, p, newValue, receiver);
      }
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
