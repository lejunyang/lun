---
title: StaticConfig 静态配置
lang: zh-CN
---

全局静态配置提供了诸多内部行为的自定义，大部分都需要在组件使用前修改，动态修改它们不会生效。目前的配置如下：

```ts
export type ComponentStyles = Record<'common' | OpenShadowComponentKey, (string | CSSStyleSheet)[]>;

export declare const GlobalStaticConfig: {
  /** determines the prefix of all component's tag name and class name */
  namespace: string, // default: 'l'
  /** determines the block separator of component's class in BEM naming method, e.g. `l-button` */
  commonSeparator: string, // default: '-'
  /** determines the element separator of component's class in BEM naming method, e.g. `l-input__suffix` */
  elementSeparator: string, // default: '__'
  /** determines the modifier separator of component's class in BEM naming method, e.g. `l-input--size-2` */
  modifierSeparator: string, // default: '--'
  /** determines the state prefix of component's class in BEM naming method, e.g. `is-checked` */
  statePrefix: string, // default: 'is-'

  /**
   * custom element's state will be set on native CustomElementState of ElementInternals, but it's not widely supported.
   * this option is used to control whether to reflect the states to attribute.
   * if set to 'always', the states will always be reflected to attribute,
   * if set to 'auto', the states will be reflected to attribute when native CustomElementState is not supported,
   */
  reflectStateToAttr: 'auto' | 'always' | 'never';
  /** determine whether to use dataset or class to reflect component's state to attribute */
  stateAttrType: 'dataset' | 'class';
  /** 
   * determine whether to ignore attributes of components, so that they won't trigger component's update, return `true` to ignore that attribute.
   * By default, it ignores class, part, exportparts, all data- and aria- attributes, style attribute of many components are also ignored
   */
  ignoreAttrsUpdate: (comp: ComponentKey, attribute: string, ce: VueElement) => boolean | void;
  /** define transformers to transform element's attributes to props */
  attrTransform: Record<ComponentKey | 'common', Record<string, (value: string | null) => any>>;
  /** a map of component's name to its all defined names set, e.g. `button` to `Set(['l-button', 'my-button'])` */
  actualNameMap: Record<ComponentKey, Set<string>>;
  /** define default props of every component */
  defaultProps: Record<ComponentKey, object>;
  /** whether to use constructed CSSStyleSheet when possible */
  preferCSSStyleSheet: boolean;
  /** whether wrap @layer for components' styles */
  wrapCSSLayer: boolean | string,
  /** define the preprocessor used to process component's styles, it should return processed css string */
  stylePreprocessor: (css: string) => string,
  /** define every components' static styles, also can set global common style with `common` key */
  styles: ComponentStyles;
  /**
   * 'status' and 'color', these two theme props can affect the actual color of components. `colorPriority` determines which one will be used first.
   * - `highlight-first`: use 'status' first if it's highlight status(error and warning). this is the default behavior
   * - `status-first`: use 'status' first
   * - `color-first`: use 'color' first
   */
  colorPriority: ColorPriority,
  /** must define the breakpoints from smallest to largest */
  breakpoints: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  /** function used to request icon url, should return html string */
  iconRequest: (url?: string | null) => Promise<string | undefined>;
  /** function used to process html string before using it, you can use this to do XSS filter */
  htmlPreprocessor: (html: string) => string;
  /** registered custom renderers */
  customRendererRegistry: Record<string | symbol, CustomRendererRegistry>;
  /**
   * define every components' event init map, it's used to initialize the event object when dispatch event
   * every entry accepts object or array value:
   * - object value: `{ button: { composed: true, bubbles: true } }`, the object will be used for every event for that component
   * - array value: `{ button: [{ composed: true }, { validClick: { bubbles: true } }] }` the first value will be used for every event, the second object can be the corresponding event's init(event name must be camelCase)
   */
  eventInitMap: Record<ComponentKey | 'common', Omit<CustomEventInit, 'detail'> | [Omit<CustomEventInit, 'detail'>, Record<string, Omit<CustomEventInit, 'detail'>>])>
  /** define the math preset methods used to process numbers */
  math: Required<MathMethods<number>>;
  /** define the date preset methods used to process dates */
  date: FinalDateMethods<any>;
};
```
