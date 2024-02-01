import { isSupportCSSStyleSheet } from '@lun/utils';
import { error } from '../../utils';
import {
  getInitialDefaultAnimationRegistry,
  getInitialElementAnimationRegistry,
} from '../animation/animation.registry';
import { getInitialCustomRendererMap } from '../custom-renderer/renderer.registry';
import { presets } from '@lun/core';

export const noShadowComponents = Object.freeze(['custom-renderer'] as const);
export const shadowComponents = Object.freeze([
  'button',
  'checkbox',
  'checkbox-group',
  'dialog',
  'divider',
  'form',
  'form-item',
  'icon',
  'input',
  'popover',
  'radio',
  'radio-group',
  'select',
  'select-option',
  'select-optgroup',
  'spin',
  'switch',
  'tag',
  'theme-provider',
  'tooltip',
  'upload',
] as const);
export const components = Object.freeze([...shadowComponents, ...noShadowComponents] as const);
export type ComponentKey = (typeof components)[number];
export type ShadowComponentKey = (typeof shadowComponents)[number];

export type ComponentStyles = Record<'common' | ShadowComponentKey, (string | CSSStyleSheet)[]>;

const styles = shadowComponents.reduce(
  (result, name) => {
    result[name] = [];
    return result;
  },
  { common: [] } as unknown as ComponentStyles,
);

/**
 * Please make sure modify the GlobalStaticConfig before you import the component or read the config\
 * change it dynamically may not work
 */
export const GlobalStaticConfig = new Proxy(
  {
    namespace: 'l',
    commonSeparator: '-',
    elementSeparator: '__',
    modifierSeparator: '--',
    statePrefix: 'is-',
    /**
     * custom element's state will be set on native CustomElementState of ElementInternals, but it's not widely supported.
     * this option is used to control whether to reflect the states to attribute.
     * if set to 'always', the states will always be reflected to attribute, 
     * if set to 'auto', the states will be reflected to attribute when native CustomElementState is not supported,
     */
    reflectStateToAttr: 'auto' as 'always' | 'never' | 'auto',
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
      'checkbox-group': {},
      'custom-renderer': {},
      dialog: {
        escapeClosable: true,
        width: '450px',
        panelTransition: 'scale',
        maskTransition: 'bgFade',
      },
      divider: {},
      form: {
        plainName: undefined,
        layout: 'grid' as const,
        cols: '1',
        labelWidth: 'max-content',
      },
      'form-item': {
        plainName: undefined,
        colonMark: ':',
        requiredMark: '*',
        requiredMarkAlign: 'start',
        helpType: 'icon',
        required: undefined, // runIfFn(required, formContext) ?? localRequired.value
        clearWhenDepChange: undefined, // need to be undefined, cause used in virtualGetMerge
        disableWhenDepFalsy: undefined,
        requireWhenDepTruthy: undefined,
        validateWhen: ['blur', 'depChange'],
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
        updateWhen: 'auto',
        restrictWhen: 'not-composing',
        transformWhen: 'not-composing',
        showClearIcon: true,
        separator: /[\s,]/,
        showStatusIcon: true,
        stepControl: 'up-down',
        required: undefined,
      },
      popover: {
        offset: 4,
        open: undefined, // must be undefined, otherwise it will be controlled
        showArrow: true,
        useTransform: false,
        transition: 'fade',
      },
      radio: {
        labelPosition: 'end' as const,
      },
      'radio-group': {},
      select: {
        autoClose: true,
        upDownToggle: true,
        autoActivateFirst: true,
      },
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
      tag: {
        transition: 'scaleOut',
      },
      'theme-provider': {},
      tooltip: {
        open: undefined, // must be undefined, otherwise it will be controlled
        showArrow: true,
        transition: 'scale',
      },
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
    ...presets,
  },
  {
    get(target, p, receiver) {
      // deep get, or remove components key
      return Reflect.get(p in presets ? presets : target, p, receiver);
    },
    set(target: any, p, newValue, receiver) {
      const oldVal = target[p];
      if (__DEV__ && Object.getPrototypeOf(oldVal) !== Object.getPrototypeOf(newValue)) {
        error(`Invalid static config was set on ${String(p)}`, 'old config:', target[p], 'new config:', newValue);
        return false;
      } else {
        return Reflect.set(p in presets ? presets : target, p, newValue, receiver);
      }
    },
  },
);
