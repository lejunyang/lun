---
title: StaticConfig 静态配置
lang: zh-CN
---

- 静态配置提供了诸多内部行为的自定义，大部分都需要在组件使用前修改，动态修改它们不会生效

```ts
export type ComponentStyles = Record<'common' | OpenShadowComponentKey, (string | CSSStyleSheet)[]>;

export declare const GlobalStaticConfig: {
  namespace: string;
  commonSeparator: string;
  elementSeparator: string;
  modifierSeparator: string;
  statePrefix: string;
  /**
   * custom element's state will be set on native CustomElementState of ElementInternals, but it's not widely supported.
   * this option is used to control whether to reflect the states to attribute.
   * if set to 'always', the states will always be reflected to attribute,
   * if set to 'auto', the states will be reflected to attribute when native CustomElementState is not supported,
   */
  reflectStateToAttr: 'auto' | 'always' | 'never';
  nameMap: {
    readonly [k in ComponentKey]: string;
  };
  actualNameMap: Record<ComponentKey, Set<string>>;
  defaultProps: Record<ComponentKey, object>;
  preferCSSStyleSheet: boolean;
  /** define every components' static styles, also can set global common style with `common` key */
  styles: ComponentStyles;
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

<!--this file is copied from Chinese md, remove this comment to update it, or it will be overwritten on next build-->