import { freeze, isSupportCSSStyleSheet, supportCSSLayer } from '@lun/utils';
import { error } from '../../utils';
import {
  getInitialDefaultAnimationRegistry,
  getInitialElementAnimationRegistry,
} from '../animation/animation.registry';
import { getInitialCustomRendererMap } from '../custom-renderer/renderer.registry';
import { presets } from '@lun/core';
import { reduceFromComps } from './utils';

const holderName = 'teleport-holder';
export const componentsWithTeleport = freeze(['message', 'popover', 'select'] as const);
export const noShadowComponents = freeze(['custom-renderer'] as const);
export const closedShadowComponents = freeze(['watermark'] as const);
export const openShadowComponents = freeze([
  'button',
  'calendar',
  'callout',
  'checkbox',
  'checkbox-group',
  'color-picker',
  'date-picker',
  'dialog',
  'divider',
  'doc-pip',
  'file-picker',
  'form',
  'form-item',
  'icon',
  'input',
  'mentions',
  'message',
  'popover',
  'progress',
  'radio',
  'radio-group',
  'range',
  'select',
  'select-option',
  'select-optgroup',
  'spin',
  'switch',
  'tabs',
  'tab-item',
  'tag',
  holderName,
  'textarea',
  'theme-provider',
  'tooltip',
  'tour',
] as const);
export const components = freeze([...openShadowComponents, ...noShadowComponents, ...closedShadowComponents] as const);
export type ComponentKey = (typeof components)[number];
export type OpenShadowComponentKey = (typeof openShadowComponents)[number];

export type ComponentStyles = Record<'common' | OpenShadowComponentKey, (string | CSSStyleSheet)[]>;

export type ColorPriority = 'highlight-first' | 'status-first' | 'color-first';

const styles = reduceFromComps(() => [] as (string | CSSStyleSheet)[], true) as ComponentStyles;

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
    /** define default props of every component */
    defaultProps: components.reduce((result, name) => {
      result[name] = {};
      return result;
    }, {} as Record<ComponentKey, Record<string, any>>),
    preferCSSStyleSheet: isSupportCSSStyleSheet(),
    /** whether wrap &#64;layer for components' styles. will use it as layer name if it's truthy string, or use 'lun' as default */
    wrapCSSLayer: supportCSSLayer as boolean | string,
    stylePreprocessor: (css: string) => css,
    /**
     * 'status' and 'color', these two theme props can affect the actual color of components. 'colorPriority' determines which one will be used first.
     * - `highlight-first`: use 'status' first if it's highlight status(error and warning). this is the default behavior
     * - `status-first`: use 'status' first
     * - `color-first`: use 'color' first
     */
    colorPriority: '' as ColorPriority,
    availableVariants: reduceFromComps(() => new Set<string>()),
    /** define every components' static styles, also can set global common style with `common` key */
    styles,
    computedStyles: new Proxy(styles, {
      get(target, p, receiver) {
        const commons = Reflect.get(target, 'common', receiver);
        const targetStyles = Reflect.get(target, p, receiver);
        if (p === 'common') return [...commons];
        else if (p === holderName)
          return commons
            .concat(targetStyles)
            .concat(...componentsWithTeleport.map((name) => Reflect.get(target, name, receiver)));
        return commons.concat(targetStyles);
      },
    }),
    /** must define the breakpoints from smallest to largest */
    breakpoints: {
      xs: '520px',
      sm: '768px',
      md: '1024px',
      lg: '1280px',
      xl: '1640px',
    },
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
    ...(presets as Omit<import('@lun/core').Presets, 'date'> & {
      /**
       * @example
       * use below way to customize the date type
       * declare module '@lun/core' {
       *   export interface DateInterface {
       *     date: Dayjs;
       *   }
       * }
       */
      date: import('@lun/core').DateMethods<import('@lun/core').DateValueType>;
    }),
  },
  {
    get(target, p, receiver) {
      const val = Reflect.get(p in presets ? presets : target, p, receiver);
      if (__DEV__ && val == null) throw new Error(`GlobalStaticConfig '${String(p)}' has not been defined yet`);
      return val;
    },
    set(target: any, p, newValue, receiver) {
      const oldVal = target[p];
      if (__DEV__ && (!newValue || (oldVal && Object.getPrototypeOf(oldVal) !== Object.getPrototypeOf(newValue)))) {
        error(`Invalid static config was set on ${String(p)}`, 'old config:', target[p], 'new config:', newValue);
        return false;
      } else {
        return Reflect.set(p in presets ? presets : target, p, newValue, receiver);
      }
    },
  },
);
