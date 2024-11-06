import { freeze, isSupportCSSStyleSheet, supportCSSLayer } from '@lun-web/utils';
import { error } from '../../utils';
import { getInitialCustomRendererMap } from '../custom-renderer/renderer.registry';
import { presets } from '@lun-web/core';
import { reduceFromComps } from './utils';
import { VueElement } from 'custom';

const holderName = 'teleport-holder';
export const componentsWithTeleport = freeze(['message', 'popover', 'select'] as const);
export const noShadowComponents = freeze(['custom-renderer', 'virtual-renderer'] as const);
export const closedShadowComponents = freeze(['watermark'] as const);
export const openShadowComponents = freeze([
  'accordion',
  'accordion-group',
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
  'scroll-view',
  'select',
  'select-option',
  'select-optgroup',
  'skeleton',
  'spin',
  'switch',
  'tabs',
  'tab-item',
  'tag',
  holderName,
  'text',
  'textarea',
  'theme-provider',
  'tooltip',
  'tour',
  'tree',
  'tree-item',
] as const);
export const components = freeze([...openShadowComponents, ...noShadowComponents, ...closedShadowComponents] as const);
export type ComponentKey = (typeof components)[number];
export type OpenShadowComponentKey = (typeof openShadowComponents)[number];

export type ComponentStyles = Record<'common' | OpenShadowComponentKey, (string | CSSStyleSheet)[]>;

export type ColorPriority = 'highlight-first' | 'status-first' | 'color-first';

const styles = reduceFromComps(() => [] as (string | CSSStyleSheet)[], false) as ComponentStyles;

const ignoreAttrSet = new Set(['class', 'part', 'exportparts', 'style']),
  needStyleComps = new Set(['form', 'form-item', 'tag', 'tooltip', 'divider', 'watermark']);

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
     * this option is used to control whether to reflect the states to attribute.
     * if set to 'always', the states will always be reflected to attribute,
     * if set to 'auto', the states will be reflected to attribute when native CustomElementState is not supported,
     */
    reflectStateToAttr: 'always' as 'always' | 'never' | 'auto',
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
    /** define transformers to transform element's attributes to props */
    attrTransform: reduceFromComps(() => ({} as Record<string, (val: string | null) => any>), true, true),
    /** a map of component's name to its all defined names set, e.g. `button` to `Set(['l-button', 'my-button'])` */
    actualNameMap: reduceFromComps(() => new Set<string>()),
    /** define default props of every component */
    defaultProps: reduceFromComps(() => ({} as Record<string, any>)),
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
    availableVariants: reduceFromComps(() => new Set<string>(), false, false),
    /** define every components' static styles, also can set global common style with `common` key */
    styles,
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
    /**
     * define every components' event init map, it's used to initialize the event object when dispatch event
     * every entry accepts object or array value:
     * - object value: `{ button: { composed: true, bubbles: true } }`, the object will be used for every event for that component
     * - array value: `{ button: [{ composed: true }, { validClick: { bubbles: true } }] }` the first value will be used for every event, the second object can be the corresponding event's init(event name must be camelCase)
     */
    eventInitMap: reduceFromComps(
      () =>
        ({} as
          | Omit<CustomEventInit, 'detail'>
          | [Omit<CustomEventInit, 'detail'>, Record<string, Omit<CustomEventInit, 'detail'>>]),
      true,
      true,
    ),
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
