import { hasOwn, isSupportCSSStyleSheet, supportCSSLayer } from '@lun-web/utils';
import { error } from '../../utils';
import { getInitialCustomRendererMap } from '../custom-renderer/renderer.registry';
import { presets } from '@lun-web/core';
import { ComponentKey, compStatic } from './utils';
import { VueElement } from 'custom';

export type ColorPriority = 'highlight-first' | 'status-first' | 'color-first';

const ignoreAttrSet = new Set(['class', 'part', 'exportparts', 'style']),
  needStyleComps = new Set(['form-item', 'tag', 'tooltip', 'divider', 'watermark']);

export type EventNameStyle = 'kebab' | 'camel' | 'pascal' | 'lower' | 'upper';

/**
 * Please make sure modify the GlobalStaticConfig before you import the component or read the config\
 * change it dynamically may not work
 */
export const GlobalStaticConfig = new Proxy(
  {
    /** determines the prefix of all component's tag name and class name */
    namespace: 'l',
    /** determines the block separator of component's class in BEM naming method, e.g. `l-button` */
    commonSeparator: '-',
    /** determines the element separator of component's class in BEM naming method, e.g. `l-input__suffix` */
    elementSeparator: '__',
    /** determines the modifier separator of component's class in BEM naming method, e.g. `l-input--size-2` */
    modifierSeparator: '--',
    /** determines the state prefix of component's class in BEM naming method, e.g. `is-checked` */
    statePrefix: 'is-',
    /**
     * custom element's state will be set on native CustomElementState of ElementInternals, but it's not widely supported.
     * this option is used to control whether to reflect the states to attributes. it can be:
     * - `always`: the states will always be reflected to attributes
     * - `auto`: the states will be reflected to attribute when native CustomStateSet is not supported
     * - `double-dash`: the states will be reflected to attribute when CustomStateSet is supported for double dashes (for chromium 90 ~ 125)
     */
    reflectStateToAttr: 'always' as 'always' | 'never' | 'auto' | 'double-dash',
    /** determine whether to use dataset or class to reflect component's state to attribute */
    stateAttrType: 'dataset' as 'dataset' | 'class',
    /**
     * determine whether to ignore attributes of components, so that they won't trigger component's update, return `true` to ignore that attribute.
     * By default, it ignores class, part, exportparts, all data- and aria- attributes, style attribute of many components are also ignored
     */
    ignoreAttrsUpdate: ((comp, attr) => {
      if (needStyleComps.has(comp) && attr === 'style') return false;
      if (ignoreAttrSet.has(attr) || attr.startsWith('data-') || attr.startsWith('aria-')) return true;
    }) as (comp: ComponentKey, attribute: string, ce: VueElement) => boolean | void,
    ...compStatic,
    eventNameStyle: ['camel', 'kebab', 'pascal'] as EventNameStyle | EventNameStyle[],
    /** whether to use constructed CSSStyleSheet when possible */
    preferCSSStyleSheet: isSupportCSSStyleSheet(),
    /** whether wrap &#64;layer for components' styles */
    wrapCSSLayer: supportCSSLayer as boolean | string,
    /** define the preprocessor used to process component's styles, it should return processed css string */
    stylePreprocessor: (css: string) => css,
    /**
     * 'status' and 'color', these two theme props can affect the actual color of components.
     * They can be from there levels: component's self props, parent's props or theme context config.
     * If both of them are provided in same level, `colorPriority` will determine which one will be used first.
     * - `highlight-first`: use 'status' first if it's highlight status(error and warning). this is the default behavior
     * - `status-first`: use 'status' first
     * - `color-first`: use 'color' first
     */
    colorPriority: '' as ColorPriority,
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
    /** function used to process html string before using it, you can use this to do XSS filter */
    htmlPreprocessor: (html: string) => html,
    customRendererRegistry: getInitialCustomRendererMap(),
    ...(presets as {
      math: Required<
        import('@lun-web/core').MathMethods<
          import('@lun-web/utils').BigIntDecimal,
          number | import('@lun-web/utils').BigIntDecimal
        >
      >;
      /**
       * @example
       * use below way to customize the date type
       * declare module '@lun-web/core' {
       *   export interface DateInterface {
       *     date: Dayjs;
       *   }
       * }
       */
      date: import('@lun-web/core').DateMethods<import('@lun-web/core').DateValueType>;
    }),
  },
  {
    get(target, p, receiver) {
      const val = Reflect.get(p in presets ? presets : target, p, receiver);
      if (__DEV__ && val == null && hasOwn(target, p))
        throw new Error(`GlobalStaticConfig '${String(p)}' has not been defined yet`);
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
