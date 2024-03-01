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
  /** readonly */
  computedStyles: Readonly<ComponentStyles>;
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
  /** function used to process html string before pass it to v-html, you can use this to do XSS filter */
  vHtmlPreprocessor: (html: string) => string;
  customRendererMap: Record<string | symbol, CustomRendererRegistry>;
  /** useless for now, consider to remove it */
  animationRegistry: Record<string | symbol, ElementAnimation>;
  /** useless for now, consider to remove it */
  elAnimationRegistry: WeakMap<Element, Record<string | symbol, ElementAnimation>>;
  /** define the methods used to process numbers, now used in number input only */
  math: Required<MathMethods<number>>;
};
```